import express from 'express';
import { db } from '../db.js';
import { authenticateAdmin } from '../auth.js';

const router = express.Router();

// Helper to determine date bounds in Asia/Dhaka
function getDateRangeBounds(period, customStart, customEnd) {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  // Reset hours to start of day in local/BD context
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'last7days':
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'lastMonth':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'custom':
      if (customStart) start = new Date(customStart);
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
      break;
    default:
      // Default to last 30 days
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
  }

  return { startTime: start.getTime(), endTime: end.getTime(), startDateStr: start.toISOString(), endDateStr: end.toISOString() };
}

// 1. GET COMPREHENSIVE FINANCIAL & SALES REPORT
const handleGetFinancials = (req, res) => {
  const { period = 'last7days', startDate, endDate } = req.query;
  const { startTime, endTime, startDateStr, endDateStr } = getDateRangeBounds(period, startDate, endDate);

  const orders = db.getOrders();
  const expenses = db.getExpenses();
  const products = db.getProducts();

  // Filter orders by date range
  const rangeOrders = orders.filter((o) => {
    const t = new Date(o.date).getTime();
    return t >= startTime && t <= endTime;
  });

  // Filter expenses by date range
  const rangeExpenses = expenses.filter((e) => {
    const t = new Date(e.date).getTime();
    return t >= startTime && t <= endTime;
  });

  // Calculate metrics according to documented financial accounting standards:
  // 1. Cancelled orders
  const cancelledOrders = rangeOrders.filter((o) => (o.fulfillmentStatus || o.status) === 'cancelled');
  const cancelledValue = cancelledOrders.reduce((s, o) => s + (o.financials?.total || 0), 0);

  // 2. Returned orders
  const returnedOrders = rangeOrders.filter((o) => (o.fulfillmentStatus || o.status) === 'returned');
  const returnedValue = returnedOrders.reduce((s, o) => s + (o.financials?.total || 0), 0);

  // 3. Valid sales orders (non-cancelled, non-returned)
  const validOrders = rangeOrders.filter(
    (o) => (o.fulfillmentStatus || o.status) !== 'cancelled' && (o.fulfillmentStatus || o.status) !== 'returned'
  );

  // Gross Sales: sum of item list price before discounts
  const grossSales = validOrders.reduce((sum, o) => sum + (o.financials?.subtotal || 0), 0);

  // Discounts given
  const discounts = validOrders.reduce((sum, o) => sum + (o.financials?.discount || 0), 0);

  // Shipping fees collected
  const shippingCollected = validOrders.reduce((sum, o) => sum + (o.financials?.shipping || 0), 0);

  // Net Sales: Gross Sales - Discounts
  const netSales = grossSales - discounts;

  // Cost of Goods Sold (COGS): actual purchase cost of sold items
  const cogs = validOrders.reduce((sum, o) => {
    if (o.financials?.cogs !== undefined) return sum + o.financials.cogs;
    const orderCogs = (o.items || []).reduce((itemSum, item) => itemSum + ((item.unitCost || 0) * (item.quantity || 1)), 0);
    return sum + orderCogs;
  }, 0);

  // Gross Profit = Net Sales - COGS
  const grossProfit = netSales - cogs;
  const grossMarginPercent = netSales > 0 ? Number(((grossProfit / netSales) * 100).toFixed(2)) : 0;

  // Operating Expenses in this period
  const totalOperatingExpenses = rangeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Net Operating Profit = Gross Profit - Operating Expenses
  const netOperatingProfit = grossProfit - totalOperatingExpenses;
  const netProfitMarginPercent = netSales > 0 ? Number(((netOperatingProfit / netSales) * 100).toFixed(2)) : 0;

  // Cash collections vs Outstanding COD
  // Collected Payments: orders marked as paid
  const collectedPayments = validOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.financials?.total || 0), 0);

  // Outstanding COD Settlements: delivered or in-transit COD orders not yet marked paid
  const outstandingCodOrders = validOrders.filter(
    (o) => o.paymentMethod === 'cod' && o.paymentStatus !== 'paid'
  );
  const outstandingCodAmount = outstandingCodOrders.reduce((sum, o) => sum + (o.financials?.total || 0), 0);

  // Total Valid Orders count and Average Order Value (AOV)
  const totalValidOrdersCount = validOrders.length;
  const aov = totalValidOrdersCount > 0 ? Math.round(netSales / totalValidOrdersCount) : 0;

  // Best-selling products in this period
  const productSalesMap = {};
  validOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          productId: item.productId,
          sku: item.sku,
          title: item.title,
          image: item.image,
          unitsSold: 0,
          revenue: 0,
          grossProfit: 0,
        };
      }
      const lineRevenue = (item.unitPrice || 0) * (item.quantity || 1);
      const lineCost = (item.unitCost || 0) * (item.quantity || 1);
      productSalesMap[item.productId].unitsSold += item.quantity || 1;
      productSalesMap[item.productId].revenue += lineRevenue;
      productSalesMap[item.productId].grossProfit += (lineRevenue - lineCost);
    });
  });

  const bestSellers = Object.values(productSalesMap).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 10);

  // Low stock products alert
  const lowStockProducts = products
    .filter((p) => (p.stock || 0) <= (p.lowStockThreshold || 5))
    .map((p) => ({
      id: p.id,
      sku: p.sku,
      title: p.title,
      vendor: p.vendor,
      stock: p.stock || 0,
      lowStockThreshold: p.lowStockThreshold || 5,
      costPrice: p.costPrice,
      sellingPrice: p.price,
      isOutOfStock: (p.stock || 0) <= 0,
    }))
    .sort((a, b) => a.stock - b.stock);

  // Daily time series for charts
  const daysMap = {};
  const dayMs = 24 * 60 * 60 * 1000;
  const numDays = Math.min(31, Math.ceil((endTime - startTime) / dayMs));

  for (let i = 0; i < numDays; i++) {
    const d = new Date(startTime + i * dayMs);
    const dateKey = d.toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit', month: 'short' });
    daysMap[dateKey] = { date: dateKey, grossSales: 0, netSales: 0, cogs: 0, profit: 0, orders: 0 };
  }

  validOrders.forEach((o) => {
    const d = new Date(o.date);
    const dateKey = d.toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit', month: 'short' });
    if (daysMap[dateKey]) {
      const sale = (o.financials?.subtotal || 0) - (o.financials?.discount || 0);
      const cost = o.financials?.cogs || 0;
      daysMap[dateKey].grossSales += (o.financials?.subtotal || 0);
      daysMap[dateKey].netSales += sale;
      daysMap[dateKey].cogs += cost;
      daysMap[dateKey].profit += (sale - cost);
      daysMap[dateKey].orders += 1;
    }
  });

  const timelineChart = Object.values(daysMap);

  res.json({
    period,
    dateRange: { start: startDateStr, end: endDateStr, timeZone: 'Asia/Dhaka' },
    financials: {
      grossSales,
      discounts,
      refunds: returnedValue,
      netSales,
      cogs,
      grossProfit,
      operatingExpenses: totalOperatingExpenses,
      netOperatingProfit,
      collectedPayments,
      outstandingCod: outstandingCodAmount,
    },
    metrics: {
      grossSalesBdt: grossSales,
      discountsBdt: discounts,
      shippingCollectedBdt: shippingCollected,
      cancelledOrdersCount: cancelledOrders.length,
      cancelledValueBdt: cancelledValue,
      returnsCount: returnedOrders.length,
      returnsValueBdt: returnedValue,
      netSalesBdt: netSales,
      cogsBdt: cogs,
      grossProfitBdt: grossProfit,
      grossMarginPercent,
      operatingExpensesBdt: totalOperatingExpenses,
      netOperatingProfitBdt: netOperatingProfit,
      netProfitMarginPercent,
      collectedPaymentsBdt: collectedPayments,
      outstandingCodSettlementsBdt: outstandingCodAmount,
      outstandingCodOrdersCount: outstandingCodOrders.length,
      totalOrdersCount: totalValidOrdersCount,
      allOrdersCount: rangeOrders.length,
      averageOrderValueBdt: aov,
    },
    bestSellers,
    lowStockProducts,
    timelineChart,
    formulasDocumentation: {
      grossSales: 'Sum of subtotal (unitPrice × quantity) across all valid orders',
      netSales: 'Gross Sales minus promotional discounts and refunds',
      cogs: 'Cost of Goods Sold: Sum of (item unit purchase cost × quantity)',
      grossProfit: 'Net Sales minus COGS',
      operatingExpenses: 'Sum of operational costs (Rent, Courier, Ads, Packaging, Utilities, Salaries)',
      netOperatingProfit: 'Gross Profit minus Operating Expenses',
      collectedPayments: 'Cash actually settled/received (Online paid + courier remitted COD cash)',
      outstandingCod: 'Delivered/in-transit COD orders awaiting cash remittance from courier',
    },
  });
};

router.get('/financials', authenticateAdmin, handleGetFinancials);
router.get('/summary', authenticateAdmin, handleGetFinancials);
router.get('/', authenticateAdmin, handleGetFinancials);

// 2. EXPORT FINANCIAL REPORT AS CSV
router.get('/export/csv', authenticateAdmin, (req, res) => {
  const { period = 'thisMonth', startDate, endDate } = req.query;
  const { startTime, endTime, startDateStr, endDateStr } = getDateRangeBounds(period, startDate, endDate);

  const orders = db.getOrders().filter((o) => {
    const t = new Date(o.date).getTime();
    return t >= startTime && t <= endTime;
  });

  const valid = orders.filter((o) => !['cancelled', 'returned'].includes(o.fulfillmentStatus || o.status));

  const gross = valid.reduce((s, o) => s + (o.financials?.subtotal || 0), 0);
  const discount = valid.reduce((s, o) => s + (o.financials?.discount || 0), 0);
  const net = gross - discount;
  const cogs = valid.reduce((s, o) => s + (o.financials?.cogs || 0), 0);
  const gp = net - cogs;

  const expenses = db.getExpenses().filter((e) => {
    const t = new Date(e.date).getTime();
    return t >= startTime && t <= endTime;
  });
  const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netProfit = gp - totalExp;

  const csvRows = [
    'Metric,Amount (BDT),Formula / Basis',
    `Gross Equipment Sales,${gross},"Subtotal before discounts"`,
    `Promotional Discounts,${discount},"Voucher & coupon reductions"`,
    `Net Sales Revenue,${net},"Gross Sales - Discounts"`,
    `Cost of Goods Sold (COGS),${cogs},"Historical acquisition unit cost"`,
    `Gross Operating Profit,${gp},"Net Sales - COGS"`,
    `Gross Margin (%),${net > 0 ? ((gp / net) * 100).toFixed(2) : 0}%,"Gross Profit / Net Sales"`,
    `Operating Expenses,${totalExp},"Rent, Logistics, Ads, Packaging"`,
    `Net Operating Profit,${netProfit},"Gross Profit - Operating Expenses"`,
    `Net Margin (%),${net > 0 ? ((netProfit / net) * 100).toFixed(2) : 0}%,"Net Operating Profit / Net Sales"`,
    `Total Fulfilled Orders,${valid.length},"Non-cancelled orders count"`,
    `Average Order Value (AOV),${valid.length > 0 ? Math.round(net / valid.length) : 0},"Net Sales / Valid Orders"`,
  ];

  const csvString = csvRows.join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=financial_statement_${period}_${Date.now()}.csv`);
  res.send(csvString);
});

export default router;
