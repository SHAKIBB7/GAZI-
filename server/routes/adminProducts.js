import express from 'express';
import { db } from '../db.js';
import { authenticateAdmin, requireRole } from '../auth.js';

const router = express.Router();

// Allowed cricket-specific categories (Requirement 2)
export const CRICKET_CATEGORIES = [
  'Cricket Bats',
  'Cricket Footwear',
  'Batting Equipment',
  'Cricket Protection',
  'Cricket Clothing',
  'Cricket Luggage',
  'Cricket Balls & Accessories',
];

const CATEGORY_MAP = {
  'bats': 'Cricket Bats',
  'cricket bats': 'Cricket Bats',
  'footwear': 'Cricket Footwear',
  'shoes': 'Cricket Footwear',
  'cricket footwear': 'Cricket Footwear',
  'batting': 'Batting Equipment',
  'batting equipment': 'Batting Equipment',
  'protection': 'Cricket Protection',
  'cricket protection': 'Cricket Protection',
  'pads': 'Cricket Protection',
  'gloves': 'Cricket Protection',
  'helmets': 'Cricket Protection',
  'clothing': 'Cricket Clothing',
  'cricket clothing': 'Cricket Clothing',
  'luggage': 'Cricket Luggage',
  'bags': 'Cricket Luggage',
  'cricket luggage': 'Cricket Luggage',
  'balls': 'Cricket Balls & Accessories',
  'accessories': 'Cricket Balls & Accessories',
  'cricket balls & accessories': 'Cricket Balls & Accessories',
};

// Helper to normalize and validate cricket category
function normalizeCricketCategory(category) {
  if (!category) return null;
  const lower = category.trim().toLowerCase();
  return CATEGORY_MAP[lower] || null;
}

function isValidCricketCategory(category) {
  return normalizeCricketCategory(category) !== null;
}

// 1. GET ALL PRODUCTS (Admin view with filters, pagination, sorting)
router.get('/', authenticateAdmin, (req, res) => {
  const {
    search,
    category,
    vendor,
    status,
    stockFilter,
    sort = 'newest',
    page = 1,
    limit = 20,
  } = req.query;

  let products = db.getProducts();

  // Search
  if (search) {
    const q = search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.vendor.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (category && category !== 'All') {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  // Brand / Vendor filter
  if (vendor && vendor !== 'All') {
    products = products.filter((p) => p.vendor.toLowerCase() === vendor.toLowerCase());
  }

  // Status filter (active, draft, archived)
  if (status && status !== 'all') {
    products = products.filter((p) => (p.status || 'active') === status);
  }

  // Stock filter: 'in_stock', 'low_stock', 'out_of_stock'
  if (stockFilter === 'out_of_stock') {
    products = products.filter((p) => Number(p.stock || 0) <= 0);
  } else if (stockFilter === 'low_stock') {
    products = products.filter((p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= Number(p.lowStockThreshold || 5));
  } else if (stockFilter === 'in_stock') {
    products = products.filter((p) => Number(p.stock || 0) > Number(p.lowStockThreshold || 5));
  }

  // Sorting
  switch (sort) {
    case 'price-asc':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'stock-asc':
      products.sort((a, b) => a.stock - b.stock);
      break;
    case 'stock-desc':
      products.sort((a, b) => b.stock - a.stock);
      break;
    case 'title-asc':
      products.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'newest':
    default:
      products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
  }

  const total = products.length;
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const startIndex = (p - 1) * l;
  const paginated = products.slice(startIndex, startIndex + l);

  // Compute live aggregates for dashboard badges
  const allProducts = db.getProducts();
  const summary = {
    totalCatalog: allProducts.length,
    activeCount: allProducts.filter((x) => x.status !== 'archived').length,
    lowStockCount: allProducts.filter((x) => (x.stock || 0) > 0 && (x.stock || 0) <= (x.lowStockThreshold || 5)).length,
    outOfStockCount: allProducts.filter((x) => (x.stock || 0) <= 0).length,
    totalValuationBdt: allProducts.reduce((sum, item) => sum + (item.stock || 0) * (item.costPrice || 0), 0),
    retailValueBdt: allProducts.reduce((sum, item) => sum + (item.stock || 0) * (item.price || 0), 0),
  };

  res.json({
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    products: paginated,
    summary,
  });
});

// 2. GET SINGLE PRODUCT
router.get('/:id', authenticateAdmin, (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const productWithAliases = {
    ...product,
    name: product.title,
    brand: product.vendor,
    stockQuantity: product.stock,
    specifications: product.specs,
  };
  res.json({
    ...productWithAliases,
    product: productWithAliases,
  });
});

// 3. CREATE PRODUCT
router.post('/', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), async (req, res) => {
  try {
    const title = req.body.title || req.body.name;
    const vendor = req.body.vendor || req.body.brand;
    const category = req.body.category;
    const sku = req.body.sku;
    const price = req.body.price;
    const costPrice = req.body.costPrice;
    const stock = req.body.stock !== undefined ? req.body.stock : (req.body.stockQuantity !== undefined ? req.body.stockQuantity : 0);
    const lowStockThreshold = req.body.lowStockThreshold;
    const sizes = req.body.sizes;
    const color = req.body.color;
    const images = req.body.images;
    const description = req.body.description;
    const specs = req.body.specs || req.body.specifications || {};
    const status = req.body.status;
    const franchise = req.body.franchise;
    const isNew = req.body.isNew;
    const isExclusive = req.body.isExclusive;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Product title is required' });
    }
    if (!vendor || !vendor.trim()) {
      return res.status(400).json({ error: 'Brand/Vendor is required' });
    }
    if (!category || !isValidCricketCategory(category)) {
      return res.status(400).json({
        error: `Invalid product category. Only professional cricket equipment categories are permitted: ${CRICKET_CATEGORIES.join(', ')}`,
      });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ error: 'Selling price must be a positive number in BDT' });
    }
    if (costPrice !== undefined && (isNaN(Number(costPrice)) || Number(costPrice) < 0)) {
      return res.status(400).json({ error: 'Cost price must be a valid non-negative number in BDT' });
    }

    const canonicalCategory = normalizeCricketCategory(category);
    const saved = await db.saveProduct(
      {
        title: title.trim(),
        sku: (sku || `CRK-${Date.now().toString().slice(-6)}`).toUpperCase().trim(),
        category: canonicalCategory,
        department: canonicalCategory,
        vendor: vendor.trim(),
        price: Number(price),
        costPrice: Number(costPrice || 0),
        oldPrice: req.body.oldPrice ? Number(req.body.oldPrice) : null,
        stock: Number(stock || 0),
        lowStockThreshold: Number(lowStockThreshold || 5),
        sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['Standard'],
        color: color || 'Standard',
        images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'],
        description: description || 'Premium professional cricket equipment.',
        specs: specs || {},
        status: status || 'active',
        franchise: franchise || `${vendor} Cricket`,
        isNew: Boolean(isNew),
        isExclusive: Boolean(isExclusive),
      },
      req.admin.username
    );

    const productWithAliases = {
      ...saved,
      name: saved.title,
      brand: saved.vendor,
      stockQuantity: saved.stock,
      specifications: saved.specs,
    };

    res.status(201).json({
      success: true,
      message: `Product '${saved.title}' created successfully`,
      product: productWithAliases,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. UPDATE PRODUCT
router.put('/:id', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), async (req, res) => {
  try {
    const existing = db.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let categoryUpdate = {};
    if (req.body.category) {
      if (!isValidCricketCategory(req.body.category)) {
        return res.status(400).json({
          error: `Category must be one of: ${CRICKET_CATEGORIES.join(', ')}`,
        });
      }
      const canonical = normalizeCricketCategory(req.body.category);
      categoryUpdate = { category: canonical, department: canonical };
    }

    const updated = await db.saveProduct(
      {
        ...existing,
        ...req.body,
        ...categoryUpdate,
        id: existing.id,
      },
      req.admin.username
    );

    const productWithAliases = {
      ...updated,
      name: updated.title,
      brand: updated.vendor,
      stockQuantity: updated.stock,
      specifications: updated.specs,
    };

    res.json({
      success: true,
      message: `Product '${updated.title}' updated successfully`,
      product: productWithAliases,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. ARCHIVE / UNPUBLISH TOGGLE
router.patch('/:id/archive', authenticateAdmin, requireRole(['super_admin']), async (req, res) => {
  try {
    const product = await db.archiveProduct(req.params.id, req.admin.username);
    res.json({
      success: true,
      message: `Product status changed to '${product.status}'`,
      product,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5b. HARD DELETE PRODUCT
router.delete('/:id', authenticateAdmin, requireRole(['super_admin']), async (req, res) => {
  try {
    const deleted = await db.deleteProduct(req.params.id, req.admin.username);
    res.json({
      success: true,
      message: `Product '${deleted.title}' permanently removed`,
      product: deleted,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. EXPORT PRODUCTS AS CSV
router.get('/export/csv', authenticateAdmin, (req, res) => {
  const products = db.getProducts();

  const headers = [
    'SKU',
    'Name',
    'Category',
    'Brand',
    'Cost Price (BDT)',
    'Selling Price (BDT)',
    'Old Price (BDT)',
    'Stock',
    'Low Stock Alert',
    'Status',
    'Sizes',
    'Color',
    'Description',
    'ID',
  ];

  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = products.map((p) => [
    escapeCsv(p.sku),
    escapeCsv(p.title),
    escapeCsv(p.category),
    escapeCsv(p.vendor),
    p.costPrice || 0,
    p.price || 0,
    p.oldPrice || '',
    p.stock || 0,
    p.lowStockThreshold || 5,
    escapeCsv(p.status || 'active'),
    escapeCsv((p.sizes || []).join('; ')),
    escapeCsv(p.color || ''),
    escapeCsv(p.description || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=gazi_cricket_catalog_${Date.now()}.csv`);
  res.send(csvContent);
});

// 7. BULK IMPORT PRODUCTS VIA CSV (Multipart or Raw Body)
router.post('/import/csv', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), async (req, res) => {
  try {
    const csvData = req.body.csvString;
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'csvString is required in request body' });
    }

    const lines = csvData.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV file must contain at least a header row and one product row' });
    }

    // Parse simple CSV with quoted support
    const parseCsvLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const skuIdx = header.findIndex((h) => h.includes('sku'));
    const titleIdx = header.findIndex((h) => h.includes('title') || h.includes('name'));
    const brandIdx = header.findIndex((h) => h.includes('brand') || h.includes('vendor'));
    const catIdx = header.findIndex((h) => h.includes('category'));
    const costIdx = header.findIndex((h) => h.includes('cost'));
    const priceIdx = header.findIndex((h) => h.includes('price') && !h.includes('cost') && !h.includes('old'));
    const stockIdx = header.findIndex((h) => h.includes('stock'));

    if (titleIdx === -1 || priceIdx === -1 || catIdx === -1) {
      return res.status(400).json({
        error: "Missing required columns in CSV. Required headers: 'Title', 'Category', 'Selling Price (BDT)', 'SKU', 'Brand'",
      });
    }

    const results = {
      imported: 0,
      updated: 0,
      errors: [],
    };

    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      const rowNum = i + 1;
      const title = row[titleIdx];
      const category = row[catIdx];
      const price = parseFloat(row[priceIdx]);
      const costPrice = costIdx !== -1 ? parseFloat(row[costIdx]) : 0;
      const stock = stockIdx !== -1 ? parseInt(row[stockIdx], 10) : 0;
      const vendor = brandIdx !== -1 && row[brandIdx] ? row[brandIdx] : 'Gazi Cricket';
      const sku = skuIdx !== -1 && row[skuIdx] ? row[skuIdx].toUpperCase() : `CRK-CSV-${Date.now()}-${i}`;

      if (!title) {
        results.errors.push({ row: rowNum, error: 'Empty product title' });
        continue;
      }
      if (!isValidCricketCategory(category)) {
        results.errors.push({
          row: rowNum,
          error: `Invalid category '${category}'. Permitted: ${CRICKET_CATEGORIES.join(', ')}`,
        });
        continue;
      }
      if (isNaN(price) || price <= 0) {
        results.errors.push({ row: rowNum, error: `Invalid price '${row[priceIdx]}'` });
        continue;
      }

      try {
        const existingProducts = db.getProducts();
        const existing = existingProducts.find((p) => p.sku === sku);

        if (existing) {
          await db.saveProduct(
            {
              ...existing,
              title,
              category,
              vendor,
              price,
              costPrice: isNaN(costPrice) ? existing.costPrice : costPrice,
              stock: isNaN(stock) ? existing.stock : stock,
            },
            req.admin.username
          );
          results.updated++;
        } else {
          await db.saveProduct(
            {
              title,
              sku,
              category,
              vendor,
              price,
              costPrice: isNaN(costPrice) ? 0 : costPrice,
              stock: isNaN(stock) ? 0 : stock,
              status: 'active',
            },
            req.admin.username
          );
          results.imported++;
        }
      } catch (err) {
        results.errors.push({ row: rowNum, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Bulk import completed: ${results.imported} created, ${results.updated} updated, ${results.errors.length} errors`,
      results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
