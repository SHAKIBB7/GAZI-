import express from 'express';
import { db } from '../db.js';
import { authenticateAdmin, requireRole } from '../auth.js';

const router = express.Router();

// 1. GET ALL SUPPLIERS
function handleGetSuppliers(req, res) {
  const suppliers = db.getSuppliers();
  res.json({
    total: suppliers.length,
    suppliers,
  });
}

// 2. CREATE / UPDATE SUPPLIER
async function handleSaveSupplier(req, res) {
  try {
    const { name, contactPerson, phone, email, address, categoriesSupplied, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Supplier company name is required' });
    }

    const saved = await db.saveSupplier(
      {
        id: req.body.id,
        name: name.trim(),
        contactPerson: contactPerson || '',
        phone: phone || '',
        email: email || '',
        address: address || '',
        categoriesSupplied: Array.isArray(categoriesSupplied) ? categoriesSupplied : ['Cricket Equipment'],
        notes: notes || '',
      },
      req.admin.username
    );

    res.status(201).json({
      success: true,
      message: `Supplier '${saved.name}' saved successfully`,
      supplier: saved,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// 3. GET ALL PURCHASES (Purchase Orders)
function handleGetPurchases(req, res) {
  const { supplierId, status, page = 1, limit = 20 } = req.query;

  let purchases = db.getPurchases();

  if (supplierId && supplierId !== 'all') {
    purchases = purchases.filter((po) => po.supplierId === supplierId);
  }

  if (status && status !== 'all') {
    purchases = purchases.filter((po) => po.status === status);
  }

  const total = purchases.length;
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const startIndex = (p - 1) * l;
  const paginated = purchases.slice(startIndex, startIndex + l);

  const allPurchases = db.getPurchases();
  const summary = {
    totalPurchasesAmountBdt: allPurchases.reduce((s, p) => s + (p.totalAmount || 0), 0),
    totalPaidBdt: allPurchases.reduce((s, p) => s + (p.amountPaid || 0), 0),
    totalBalanceDueBdt: allPurchases.reduce((s, p) => s + (p.balanceDue || 0), 0),
    totalOrdersCount: allPurchases.length,
  };

  res.json({
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    purchases: paginated,
    summary,
  });
}

// 4. CREATE NEW PURCHASE ORDER (Auto-stocks-in and updates weighted average cost)
async function handleCreatePurchase(req, res) {
  try {
    const {
      supplierId,
      items,
      additionalCosts = 0,
      amountPaid = 0,
      paymentReference,
      notes,
      referenceNo,
      shippingCost = 0,
    } = req.body;

    let supplierName = req.body.supplierName;
    if (!supplierName && supplierId) {
      const sup = db.getSuppliers().find((s) => s.id === supplierId);
      supplierName = sup ? sup.name : 'Verified Cricket Supplier';
    }

    if (!supplierId || !supplierName) {
      return res.status(400).json({ error: 'Supplier information is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one product line item is required' });
    }

    const normalizedItems = [];
    for (const item of items) {
      const pid = item.productId || item.id;
      if (!pid) return res.status(400).json({ error: 'Each line item requires a productId' });
      if (!item.quantity || Number(item.quantity) <= 0) return res.status(400).json({ error: 'Quantity must be positive' });
      if (item.unitCost === undefined || Number(item.unitCost) < 0) return res.status(400).json({ error: 'Unit cost must be valid' });
      normalizedItems.push({
        productId: pid,
        sku: item.sku || '',
        title: item.productName || item.title || 'Cricket Equipment',
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
      });
    }

    const po = await db.createPurchaseOrder(
      {
        supplierId,
        supplierName,
        poNumber: referenceNo || req.body.poNumber,
        referenceNo: referenceNo || req.body.poNumber,
        items: normalizedItems,
        additionalCosts: Number(additionalCosts || shippingCost || 0),
        amountPaid: Number(amountPaid || 0),
        paymentReference,
        notes,
        status: req.body.status || 'pending',
        receivedBy: req.admin.username,
      },
      req.admin.username
    );

    res.status(201).json({
      success: true,
      message: `Purchase order #${po.poNumber} created and ${po.status === 'received' ? 'inventory stocked into warehouse' : 'saved in pending status'}.`,
      purchaseOrder: po,
      purchase: po,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// 5. RECEIVE PURCHASE ORDER (Perform Stock-In & Weighted Average Cost Recalculation)
async function handleReceivePo(req, res) {
  try {
    const po = await db.receivePurchaseOrder(req.params.id, req.admin.username);
    res.json({
      success: true,
      message: `Purchase order #${po.poNumber || po.id} received. Warehouse stock incremented and WAC recalculated.`,
      purchase: po,
      purchaseOrder: po,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// 6. DELETE SUPPLIER
async function handleDeleteSupplier(req, res) {
  try {
    const deleted = await db.deleteSupplier(req.params.id, req.admin.username);
    res.json({
      success: true,
      message: `Supplier '${deleted.name}' deleted successfully`,
      supplier: deleted,
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

// 7. DELETE PURCHASE ORDER
async function handleDeletePurchase(req, res) {
  try {
    const deleted = await db.deletePurchase(req.params.id, req.admin.username);
    res.json({
      success: true,
      message: `Purchase order #${deleted.poNumber || deleted.id} deleted successfully`,
      purchase: deleted,
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

// ROUTE DEFINITIONS
router.get('/suppliers', authenticateAdmin, handleGetSuppliers);
router.post('/suppliers', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), handleSaveSupplier);
router.delete('/suppliers/:id', authenticateAdmin, requireRole(['super_admin']), handleDeleteSupplier);

router.get('/purchases', authenticateAdmin, handleGetPurchases);
router.post('/purchases', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), handleCreatePurchase);
router.delete('/purchases/:id', authenticateAdmin, requireRole(['super_admin']), handleDeletePurchase);

router.all('/purchases/:id/receive', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), handleReceivePo);
router.all('/:id/receive', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), handleReceivePo);

// Root path fallback depending on mount point
router.get('/', authenticateAdmin, (req, res, next) => {
  if (req.baseUrl.includes('supplier')) return handleGetSuppliers(req, res);
  if (req.baseUrl.includes('purchase')) return handleGetPurchases(req, res);
  return handleGetSuppliers(req, res);
});

router.post('/', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), (req, res, next) => {
  if (req.baseUrl.includes('supplier')) return handleSaveSupplier(req, res);
  if (req.baseUrl.includes('purchase')) return handleCreatePurchase(req, res);
  return handleSaveSupplier(req, res);
});

router.delete('/:id', authenticateAdmin, requireRole(['super_admin']), (req, res) => {
  if (req.baseUrl.includes('purchase')) return handleDeletePurchase(req, res);
  return handleDeleteSupplier(req, res);
});

export default router;
