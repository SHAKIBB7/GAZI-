import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { Expense } from '../types';
import { formatBDT } from '../../utils/bangladesh';
import {
  DollarSign,
  Plus,
  Receipt,
  Calendar,
  X,
  CreditCard,
  Building,
  Truck,
  Box,
  Megaphone,
  Zap,
} from 'lucide-react';

export const ExpensesTab: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; label: string }>>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryInput, setCategoryInput] = useState('courier_shipping');
  const [amountInput, setAmountInput] = useState<number>(5000);
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [descInput, setDescInput] = useState('');
  const [paymentMethodInput, setPaymentMethodInput] = useState('bkash');
  const [receiptRefInput, setReceiptRefInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExpenses = async () => {
    setIsLoading(true);
    const res = await adminApi.getExpenses({ category: selectedCategory });
    if (res.data) {
      setExpenses(res.data.expenses);
      setCategories(res.data.categories);
      setSummary(res.data.summary);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descInput.trim() || amountInput <= 0) return;

    setIsSubmitting(true);
    const res = await adminApi.createExpense({
      category: categoryInput,
      amount: amountInput,
      date: dateInput,
      description: descInput.trim(),
      paymentMethod: paymentMethodInput,
      receiptRef: receiptRefInput.trim(),
    });
    setIsSubmitting(false);

    if (res.data?.success) {
      setIsModalOpen(false);
      setDescInput('');
      setReceiptRefInput('');
      fetchExpenses();
    } else {
      alert(res.error || 'Failed to record expense');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-black uppercase font-mono text-white">
            Operational Expenses & Overheads
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Track warehouse lease, logistics subsidies, bubble wrap packaging, and marketing costs in BDT (৳)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
              Total Recorded Overheads
            </span>
            <span className="text-xl font-black font-mono text-amber-300">
              {formatBDT(summary?.totalOperatingExpensesBdt || 0)}
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ccff00] hover:bg-[#b5e600] text-black text-xs font-black uppercase px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* 2. Category Filter & Breakdown Pill Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-white text-black'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          All Overheads
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-[#ccff00] text-black'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <span>{c.label}</span>
            {summary?.categoryBreakdown?.[c.id] > 0 && (
              <span className="ml-1.5 font-mono text-[10px] opacity-75">
                ({formatBDT(summary.categoryBreakdown[c.id])})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Expenses Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Date & ID</th>
                <th className="py-3 px-4">Expense Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Receipt / Invoice Ref</th>
                <th className="py-3 px-4">Amount (BDT)</th>
                <th className="py-3 px-4 text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    No operating expenses recorded under this category.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="text-white font-bold">{e.date}</div>
                      <div className="text-[10px] text-neutral-500">{e.id}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-bold uppercase text-neutral-200">
                        {categories.find((c) => c.id === e.category)?.label || e.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-white font-medium max-w-sm">
                      {e.description}
                    </td>

                    <td className="py-3 px-4 uppercase font-mono text-neutral-400 text-[11px]">
                      {e.paymentMethod}
                    </td>

                    <td className="py-3 px-4 font-mono text-neutral-400">
                      {e.receiptRef || '—'}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-amber-300 text-sm">
                      {formatBDT(e.amount)}
                    </td>

                    <td className="py-3 px-4 text-right text-neutral-400">
                      {e.recordedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-black uppercase font-mono text-white">Record Operating Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Expense Category *</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Amount (BDT ৳) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amountInput}
                    onChange={(e) => setAmountInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#ccff00]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Description / Memo *</label>
                <textarea
                  required
                  rows={2}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="e.g. Monthly rent for Mirpur cricket gear storage facility..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#ccff00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Payment Method</label>
                  <select
                    value={paymentMethodInput}
                    onChange={(e) => setPaymentMethodInput(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="bkash">bKash</option>
                    <option value="bank_transfer">Bank Wire / Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Receipt / Invoice Ref</label>
                  <input
                    type="text"
                    value={receiptRefInput}
                    onChange={(e) => setReceiptRefInput(e.target.value)}
                    placeholder="INV-2026-..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !descInput.trim() || amountInput <= 0}
                  className="px-5 py-2 bg-[#ccff00] hover:bg-[#b5e600] text-black font-black uppercase rounded-xl cursor-pointer disabled:opacity-40"
                >
                  {isSubmitting ? 'Recording...' : 'Commit Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
