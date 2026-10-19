import express from 'express';
import { db } from '../db.js';
import { authenticateAdmin, requireRole } from '../auth.js';

const router = express.Router();

export const EXPENSE_CATEGORIES = [
  { id: 'courier_shipping', label: 'Courier & Shipping Charges' },
  { id: 'packaging_materials', label: 'Packaging & Bubble Wrap' },
  { id: 'warehouse_rent', label: 'Warehouse / Facility Rent' },
  { id: 'marketing_ads', label: 'Digital Ads & Marketing' },
  { id: 'salaries', label: 'Staff & Warehouse Salaries' },
  { id: 'utilities', label: 'Utilities (Electricity & Internet)' },
  { id: 'repairs_maintenance', label: 'Equipment & Office Maintenance' },
  { id: 'other', label: 'General / Miscellaneous' },
];

// 1. GET ALL EXPENSES WITH FILTERS & SUMMARY
router.get('/', authenticateAdmin, (req, res) => {
  const { category, startDate, endDate, search, page = 1, limit = 25 } = req.query;

  let expenses = db.getExpenses();

  if (category && category !== 'all') {
    expenses = expenses.filter((e) => e.category === category);
  }

  if (startDate) {
    const start = new Date(startDate).getTime();
    expenses = expenses.filter((e) => new Date(e.date).getTime() >= start);
  }

  if (endDate) {
    const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
    expenses = expenses.filter((e) => new Date(e.date).getTime() <= end);
  }

  if (search) {
    const q = search.toLowerCase();
    expenses = expenses.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        (e.receiptRef && e.receiptRef.toLowerCase().includes(q)) ||
        e.recordedBy.toLowerCase().includes(q)
    );
  }

  const allExpenses = db.getExpenses();
  const totalAmountBdt = allExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  // Group by category
  const categoryBreakdown = {};
  EXPENSE_CATEGORIES.forEach((c) => {
    categoryBreakdown[c.id] = 0;
  });
  allExpenses.forEach((e) => {
    categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + (e.amount || 0);
  });

  const total = expenses.length;
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const startIndex = (p - 1) * l;
  const paginated = expenses.slice(startIndex, startIndex + l);

  res.json({
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    expenses: paginated,
    categories: EXPENSE_CATEGORIES,
    summary: {
      totalOperatingExpensesBdt: totalAmountBdt,
      categoryBreakdown,
    },
  });
});

// 2. RECORD NEW EXPENSE
router.post('/', authenticateAdmin, requireRole(['super_admin']), async (req, res) => {
  try {
    const { category, amount, date, description, paymentMethod, receiptRef } = req.body;

    if (!category) return res.status(400).json({ error: 'Expense category is required' });
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Expense amount must be a positive number in BDT' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const saved = await db.createExpense(
      {
        category,
        amount: Number(amount),
        date: date || new Date().toISOString().split('T')[0],
        description: description.trim(),
        paymentMethod: paymentMethod || 'cash',
        receiptRef: receiptRef || '',
      },
      req.admin.username
    );

    res.status(201).json({
      success: true,
      message: `Expense of ৳${saved.amount} recorded under '${saved.category}'`,
      expense: saved,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
