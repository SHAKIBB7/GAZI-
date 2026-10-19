import express from 'express';
import { db } from '../db.js';
import { authenticateAdmin, requireRole } from '../auth.js';

const router = express.Router();

// 1. GET ALL ORDERS WITH ADVANCED SEARCH AND FILTERS
router.get('/', authenticateAdmin, (req, res) => {
  const {
    search,
    fulfillmentStatus,
    paymentStatus,
    paymentMethod,
    courier,
    startDate,
    endDate,
    sort = 'newest',
    page = 1,
    limit = 20,
  } = req.query;

  let orders = db.getOrders();

  // Search by Order ID, Tracking, Customer Name, Phone, Email
  if (search) {
    const q = search.toLowerCase().trim();
    orders = orders.filter(
      (o) =>
        o.orderId.toLowerCase().includes(q) ||
        o.trackingNumber.toLowerCase().includes(q) ||
        (o.customer?.fullName && o.customer.fullName.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.includes(q)) ||
        (o.customer?.email && o.customer.email.toLowerCase().includes(q)) ||
        (o.paymentDetails?.trxId && o.paymentDetails.trxId.toLowerCase().includes(q))
    );
  }

  // Filter by fulfillment status
  if (fulfillmentStatus && fulfillmentStatus !== 'all') {
    orders = orders.filter((o) => (o.fulfillmentStatus || o.status) === fulfillmentStatus);
  }

  // Filter by payment status (pending, paid, partially_paid, refunded)
  if (paymentStatus && paymentStatus !== 'all') {
    orders = orders.filter((o) => o.paymentStatus === paymentStatus);
  }

  // Filter by payment method (cod, bkash, nagad, rocket, card)
  if (paymentMethod && paymentMethod !== 'all') {
    orders = orders.filter((o) => o.paymentMethod === paymentMethod);
  }

  // Filter by courier (Steadfast, Pathao, RedX, Sundarban, etc.)
  if (courier && courier !== 'all') {
    orders = orders.filter((o) => o.courier && o.courier.toLowerCase().includes(courier.toLowerCase()));
  }

  // Date range filter
  if (startDate) {
    const start = new Date(startDate).getTime();
    orders = orders.filter((o) => new Date(o.date).getTime() >= start);
  }
  if (endDate) {
    const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
    orders = orders.filter((o) => new Date(o.date).getTime() <= end);
  }

  // Sorting
  switch (sort) {
    case 'total-asc':
      orders.sort((a, b) => (a.financials?.total || 0) - (b.financials?.total || 0));
      break;
    case 'total-desc':
      orders.sort((a, b) => (b.financials?.total || 0) - (a.financials?.total || 0));
      break;
    case 'oldest':
      orders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      break;
    case 'newest':
    default:
      orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      break;
  }

  // Live order KPI summary
  const allOrders = db.getOrders();
  const summary = {
    totalOrders: allOrders.length,
    pendingFulfillment: allOrders.filter((o) => ['pending', 'confirmed'].includes(o.fulfillmentStatus || o.status)).length,
    inTransit: allOrders.filter((o) => ['processing', 'shipped'].includes(o.fulfillmentStatus || o.status)).length,
    delivered: allOrders.filter((o) => (o.fulfillmentStatus || o.status) === 'delivered').length,
    cancelled: allOrders.filter((o) => (o.fulfillmentStatus || o.status) === 'cancelled').length,
    returned: allOrders.filter((o) => (o.fulfillmentStatus || o.status) === 'returned').length,
    unpaidCodOrders: allOrders.filter(
      (o) => o.paymentMethod === 'cod' && o.paymentStatus !== 'paid' && (o.fulfillmentStatus || o.status) !== 'cancelled'
    ).length,
    unpaidCodAmountBdt: allOrders
      .filter((o) => o.paymentMethod === 'cod' && o.paymentStatus !== 'paid' && (o.fulfillmentStatus || o.status) !== 'cancelled')
      .reduce((sum, o) => sum + (o.financials?.total || 0), 0),
  };

  const total = orders.length;
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const startIndex = (p - 1) * l;
  const paginated = orders.slice(startIndex, startIndex + l);

  res.json({
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    orders: paginated,
    summary,
  });
});

// 2. GET SINGLE ORDER DETAILS
router.get('/:id', authenticateAdmin, (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order reference not found' });
  }
  const orderWithAliases = {
    ...order,
    id: order.id || order.orderId,
  };
  res.json({
    ...orderWithAliases,
    order: orderWithAliases,
  });
});

// 3. UPDATE ORDER FULFILLMENT STATUS
const handleUpdateStatus = async (req, res) => {
  try {
    const { fulfillmentStatus, courier, trackingNumber, note } = req.body;

    const allowed = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'returned'];
    if (!fulfillmentStatus || !allowed.includes(fulfillmentStatus)) {
      return res.status(400).json({
        error: `Invalid fulfillment status. Permitted: ${allowed.join(', ')}. Use cancellation endpoint for cancellations.`,
      });
    }

    const updated = await db.updateOrderStatus(req.params.id, {
      fulfillmentStatus,
      courier,
      trackingNumber,
      note,
      actor: req.admin.username,
    });

    res.json({
      success: true,
      message: `Order #${updated.orderId} status updated to '${fulfillmentStatus}'`,
      order: updated,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
router.patch('/:id/status', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), handleUpdateStatus);
router.put('/:id/status', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), handleUpdateStatus);

// 4. UPDATE PAYMENT STATUS (e.g. Settle COD Cash, verify bKash TrxID)
const handleUpdatePayment = async (req, res) => {
  try {
    const { paymentStatus, trxId, paymentChannel, note } = req.body;

    const allowed = ['pending', 'paid', 'partially_paid', 'refunded'];
    if (!paymentStatus || !allowed.includes(paymentStatus)) {
      return res.status(400).json({
        error: `Invalid payment status. Permitted: ${allowed.join(', ')}`,
      });
    }

    const updated = await db.updatePaymentStatus(req.params.id, {
      paymentStatus,
      trxId,
      paymentChannel,
      note,
      actor: req.admin.username,
    });

    res.json({
      success: true,
      message: `Payment status for Order #${updated.orderId} updated to '${paymentStatus}'`,
      order: updated,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
router.patch('/:id/payment', authenticateAdmin, requireRole(['super_admin']), handleUpdatePayment);
router.put('/:id/payment', authenticateAdmin, requireRole(['super_admin']), handleUpdatePayment);

// 4b. SETTLE COD CASH PAYMENT
const handleSettleCod = async (req, res) => {
  try {
    const updated = await db.updatePaymentStatus(req.params.id, {
      paymentStatus: 'paid',
      paymentChannel: 'cash_on_delivery',
      note: 'COD cash collected by courier and reconciled to accounts',
      actor: req.admin.username,
    });

    res.json({
      success: true,
      message: `COD cash collected and settled for Order #${updated.orderId}`,
      order: updated,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
router.put('/:id/settle-cod', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), handleSettleCod);
router.post('/:id/settle-cod', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), handleSettleCod);

// 5. CANCEL ORDER (With optional safe inventory restock)
const handleCancelOrder = async (req, res) => {
  try {
    const { restock = true, reason } = req.body || {};

    const cancelledOrder = await db.cancelOrder(req.params.id, {
      restock: Boolean(restock),
      reason: reason || 'Cancelled by administrative staff',
      actor: req.admin.username,
    });

    res.json({
      success: true,
      message: `Order #${cancelledOrder.orderId} cancelled. ${restock ? 'Stock successfully restored to warehouse.' : 'No stock restored.'}`,
      order: cancelledOrder,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
router.post('/:id/cancel', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), handleCancelOrder);
router.put('/:id/cancel', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), handleCancelOrder);

// 6. PROCESS ORDER RETURN (Restock good units / log damage)
router.post('/:id/return', authenticateAdmin, requireRole(['super_admin', 'inventory_manager']), async (req, res) => {
  try {
    const { restock = true, itemsCondition = 'good', returnReason } = req.body;
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.fulfillmentStatus === 'returned' || order.status === 'returned') {
      return res.status(400).json({ error: 'Order return has already been processed and finalized' });
    }

    if (restock && order.items) {
      for (const item of order.items) {
        await db.adjustStock(item.productId, {
          quantityDelta: item.quantity,
          type: itemsCondition === 'damaged' ? 'damage' : 'return',
          referenceType: 'order_return',
          referenceId: order.orderId,
          reason: `Returned equipment: ${returnReason || 'Customer exchange/return'}. Condition: ${itemsCondition}`,
          actor: req.admin.username,
        });
      }
    }

    const updated = await db.updateOrderStatus(order.orderId, {
      fulfillmentStatus: 'returned',
      note: `Return processed by ${req.admin.username}. Condition: ${itemsCondition}. Restocked: ${restock ? 'Yes' : 'No'}. Reason: ${returnReason}`,
      actor: req.admin.username,
    });

    res.json({
      success: true,
      message: `Order #${order.orderId} return processed successfully.`,
      order: updated,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. DELETE ORDER (Restricted to super_admin)
router.delete('/:id', authenticateAdmin, requireRole(['super_admin']), async (req, res) => {
  try {
    const deleted = await db.deleteOrder(req.params.id, req.admin.username);
    res.json({
      success: true,
      message: `Order #${deleted.orderId || req.params.id} permanently deleted`,
      order: deleted,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
