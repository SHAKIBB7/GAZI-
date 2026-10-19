import express from 'express';
import { db } from '../db.js';
import { authenticateAdmin, requireRole } from '../auth.js';

const router = express.Router();

// 1. GET INVENTORY SUMMARY & CURRENT STOCK LEVELS
router.get('/levels', authenticateAdmin, (req, res) => {
  const { search, category, status, sort = 'stock-asc', page = 1, limit = 25 } = req.query;

  let products = db.getProducts();

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.vendor.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'All') {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (status === 'out_of_stock') {
    products = products.filter((p) => Number(p.stock || 0) <= 0);
  } else if (status === 'low_stock') {
    products = products.filter(
      (p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= Number(p.lowStockThreshold || 5)
    );
  } else if (status === 'in_stock') {
    products = products.filter((p) => Number(p.stock || 0) > Number(p.lowStockThreshold || 5));
  }

  // Sorting
  switch (sort) {
    case 'stock-asc':
      products.sort((a, b) => a.stock - b.stock);
      break;
    case 'stock-desc':
      products.sort((a, b) => b.stock - a.stock);
      break;
    case 'valuation-desc':
      products.sort((a, b) => (b.stock * b.costPrice) - (a.stock * a.costPrice));
      break;
    case 'title-asc':
      products.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      products.sort((a, b) => a.stock - b.stock);
  }

  const all = db.getProducts();
  const totalItemsCount = all.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalCostValuation = all.reduce((sum, p) => sum + (p.stock || 0) * (p.costPrice || 0), 0);
  const totalRetailValuation = all.reduce((sum, p) => sum + (p.stock || 0) * (p.price || 0), 0);
  const lowStockCount = all.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.lowStockThreshold || 5)).length;
  const outOfStockCount = all.filter((p) => (p.stock || 0) <= 0).length;

  const total = products.length;
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const startIndex = (p - 1) * l;
  const paginated = products.slice(startIndex, startIndex + l);

  res.json({
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    items: paginated.map((prod) => ({
      ...prod,
      stockQuantity: prod.stock,
      name: prod.title,
      costValuation: (prod.stock || 0) * (prod.costPrice || 0),
      retailValuation: (prod.stock || 0) * (prod.price || 0),
      isLowStock: (prod.stock || 0) > 0 && (prod.stock || 0) <= (prod.lowStockThreshold || 5),
      isOutOfStock: (prod.stock || 0) <= 0,
    })),
    valuationMethod: 'Weighted Average Cost (WAC) with batch acquisition tracking',
    summary: {
      totalProductsCount: all.length,
      totalUnitsInWarehouse: totalItemsCount,
      totalCostValuationBdt: totalCostValuation,
      totalRetailValuationBdt: totalRetailValuation,
      potentialGrossMarginBdt: totalRetailValuation - totalCostValuation,
      lowStockAlerts: lowStockCount,
      outOfStockAlerts: outOfStockCount,
    },
  });
});

// 2. GET STOCK MOVEMENT LEDGER (Full Audit Trail)
router.get('/ledger', authenticateAdmin, (req, res) => {
  const { productId, type, search, page = 1, limit = 30 } = req.query;

  let ledger = db.getInventoryLedger();

  if (productId) {
    ledger = ledger.filter((entry) => entry.productId === productId);
  }

  if (type && type !== 'all') {
    ledger = ledger.filter((entry) => entry.type === type);
  }

  if (search) {
    const q = search.toLowerCase();
    ledger = ledger.filter(
      (entry) =>
        (entry.sku && entry.sku.toLowerCase().includes(q)) ||
        (entry.productTitle && entry.productTitle.toLowerCase().includes(q)) ||
        (entry.referenceId && entry.referenceId.toLowerCase().includes(q)) ||
        (entry.reason && entry.reason.toLowerCase().includes(q)) ||
        (entry.actor && entry.actor.toLowerCase().includes(q))
    );
  }

  const total = ledger.length;
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const startIndex = (p - 1) * l;
  const paginated = ledger.slice(startIndex, startIndex + l);

  res.json({
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    entries: paginated,
  });
});

// 3. MANUAL STOCK ADJUSTMENT (Stock In, Stock Out, Damaged, Return, Correction)
router.post('/adjust', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), async (req, res) => {
  try {
    const { productId, reason, notes } = req.body;
    const type = req.body.type || 'adjustment';

    let delta = req.body.delta;
    if (delta === undefined && req.body.quantity !== undefined) {
      const q = Math.abs(Number(req.body.quantity));
      if (type === 'damaged' || type === 'stock_out' || type === 'damage') {
        delta = -q;
      } else {
        delta = q;
      }
    }

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    if (delta === undefined || isNaN(Number(delta)) || Number(delta) === 0) {
      return res.status(400).json({ error: 'Adjustment delta/quantity must be a non-zero integer' });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Audit reason is mandatory for any stock modification' });
    }

    const updatedProduct = await db.adjustStock(productId, {
      quantityDelta: Number(delta),
      reason: reason.trim() + (notes ? ` (${notes.trim()})` : ''),
      type,
      referenceType: type === 'damage' || type === 'damaged' ? 'damaged_goods_writeoff' : 'manual_adjustment',
      referenceId: `ADJ-${Date.now()}`,
      actor: req.admin.username,
    });

    const productWithAliases = {
      ...updatedProduct,
      stockQuantity: updatedProduct.stock,
      name: updatedProduct.title,
    };

    res.json({
      success: true,
      message: `Stock successfully adjusted for '${updatedProduct.title}'. New stock: ${updatedProduct.stock}`,
      product: productWithAliases,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. PHYSICAL STOCK RECONCILIATION
router.post('/reconcile', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), async (req, res) => {
  try {
    const { productId, reason } = req.body;
    const physicalCount = req.body.physicalCount !== undefined ? req.body.physicalCount : req.body.countedQuantity;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    if (physicalCount === undefined || isNaN(Number(physicalCount)) || Number(physicalCount) < 0) {
      return res.status(400).json({ error: 'Physical count must be a non-negative integer' });
    }

    const result = await db.reconcilePhysicalStock(
      productId,
      Number(physicalCount),
      reason || 'Routine periodic inventory physical count reconciliation',
      req.admin.username
    );

    const productWithAliases = {
      ...result.product,
      stockQuantity: result.product.stock,
      name: result.product.title,
    };

    res.json({
      success: true,
      message: result.message,
      product: productWithAliases,
      adjustment: result.adjustment !== undefined ? result.adjustment : 0,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
