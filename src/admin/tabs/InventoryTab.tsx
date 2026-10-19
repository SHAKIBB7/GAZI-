import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { InventoryItem, LedgerEntry } from '../types';
import { formatBDT } from '../../utils/bangladesh';
import {
  Package,
  History,
  RotateCcw,
  SlidersHorizontal,
  Search,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  RefreshCw,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const InventoryTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'levels' | 'ledger'>('levels');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [valuationMethod, setValuationMethod] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState('all');
  const [ledgerType, setLedgerType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Manual Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'adjustment' | 'damage' | 'return'>('adjustment');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  // Physical Reconciliation Modal
  const [reconModalOpen, setReconModalOpen] = useState(false);
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reconReason, setReconReason] = useState<string>('');
  const [isSubmittingRecon, setIsSubmittingRecon] = useState(false);

  const fetchStockLevels = async () => {
    setIsLoading(true);
    const res = await adminApi.getInventoryLevels({
      search,
      status: stockStatus,
      page,
      limit: 15,
    });
    if (res.data) {
      setItems(res.data.items);
      setSummary(res.data.summary);
      setValuationMethod(res.data.valuationMethod);
      setTotalPages(res.data.totalPages);
    }
    setIsLoading(false);
  };

  const fetchLedger = async () => {
    setIsLoading(true);
    const res = await adminApi.getInventoryLedger({
      search,
      type: ledgerType,
      page,
      limit: 25,
    });
    if (res.data) {
      setLedgerEntries(res.data.entries);
      setTotalPages(res.data.totalPages);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeSubTab === 'levels') {
      fetchStockLevels();
    } else {
      fetchLedger();
    }
  }, [activeSubTab, search, stockStatus, ledgerType, page]);

  const handleOpenAdjust = (p: InventoryItem) => {
    setSelectedProduct(p);
    setAdjustmentDelta(0);
    setAdjustmentReason('');
    setAdjustmentType('adjustment');
    setAdjustModalOpen(true);
  };

  const handleOpenReconcile = (p: InventoryItem) => {
    setSelectedProduct(p);
    setPhysicalCount(p.stock);
    setReconReason('Routine physical inventory cycle count');
    setReconModalOpen(true);
  };

  const submitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustmentDelta === 0 || !adjustmentReason.trim()) return;

    setIsSubmittingAdjust(true);
    const res = await adminApi.adjustStock(
      selectedProduct.id,
      adjustmentDelta,
      adjustmentReason.trim(),
      adjustmentType
    );
    setIsSubmittingAdjust(false);

    if (res.data?.success) {
      setAdjustModalOpen(false);
      fetchStockLevels();
    } else {
      alert(res.error || 'Failed to adjust stock');
    }
  };

  const submitReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmittingRecon(true);
    const res = await adminApi.reconcileStock(
      selectedProduct.id,
      physicalCount,
      reconReason.trim()
    );
    setIsSubmittingRecon(false);

    if (res.data?.success) {
      setReconModalOpen(false);
      fetchStockLevels();
    } else {
      alert(res.error || 'Failed to reconcile stock');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Valuation Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Warehouse Units */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Warehouse Units</span>
            <Package size={16} className="text-[#ccff00]" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-white">
            {summary?.totalUnitsInWarehouse || 0} Units
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Across {summary?.totalProductsCount || 0} cricket gear SKUs
          </div>
        </div>

        {/* Cost Valuation (WAC) */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Inventory Cost Valuation</span>
            <Layers size={16} className="text-neutral-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-neutral-300">
            {formatBDT(summary?.totalCostValuationBdt || 0)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5 truncate">
            Method: Weighted Average Cost (WAC)
          </div>
        </div>

        {/* Retail Valuation */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Retail Stock Value</span>
            <FileSpreadsheet size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-emerald-400">
            {formatBDT(summary?.totalRetailValuationBdt || 0)}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-0.5">
            Potential Margin: {formatBDT(summary?.potentialGrossMarginBdt || 0)}
          </div>
        </div>

        {/* Low / Out of stock alerts */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Stock Alerts</span>
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-amber-300">
            {summary?.lowStockAlerts || 0} Low / {summary?.outOfStockAlerts || 0} Out
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Requires procurement attention
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab Switcher */}
      <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-1.5 rounded-2xl">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              setActiveSubTab('levels');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'levels'
                ? 'bg-black text-[#ccff00] shadow-md border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Warehouse Stock Levels</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('ledger');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'ledger'
                ? 'bg-black text-[#ccff00] shadow-md border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <History size={14} />
            <span>Stock Movement Ledger (Audit Trail)</span>
          </button>
        </div>

        <button
          onClick={activeSubTab === 'levels' ? fetchStockLevels : fetchLedger}
          className="p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer mr-2"
          title="Refresh"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 3. SUB-TAB CONTENT: CURRENT STOCK LEVELS */}
      {activeSubTab === 'levels' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by title, SKU, or vendor..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#ccff00]"
              />
            </div>

            <select
              value={stockStatus}
              onChange={(e) => {
                setStockStatus(e.target.value);
                setPage(1);
              }}
              className="bg-neutral-900 border border-neutral-800 text-white text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
            >
              <option value="all">All Inventory States</option>
              <option value="in_stock">Healthy Stock (&gt; Threshold)</option>
              <option value="low_stock">Low Stock (≤ Threshold)</option>
              <option value="out_of_stock">Out of Stock (0 Units)</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/80 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Equipment SKU & Title</th>
                    <th className="py-3 px-4">Cost Price (WAC)</th>
                    <th className="py-3 px-4">Retail Price</th>
                    <th className="py-3 px-4">Physical Stock</th>
                    <th className="py-3 px-4">Cost Valuation</th>
                    <th className="py-3 px-4">Stock Health</th>
                    <th className="py-3 px-4 text-right">Ledger Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500">
                        Calculating warehouse balances...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500">
                        No equipment matched your search.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white max-w-xs truncate">{item.title}</div>
                          <div className="font-mono text-[10px] text-neutral-400">{item.sku}</div>
                        </td>

                        <td className="py-3 px-4 font-mono text-neutral-300">
                          {formatBDT(item.costPrice || 0)}
                        </td>

                        <td className="py-3 px-4 font-mono text-white font-semibold">
                          {formatBDT(item.price)}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-black text-white">
                            {item.stock}
                          </span>
                          <span className="text-[10px] text-neutral-500 block">
                            Alert at ≤ {item.lowStockThreshold || 5}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-neutral-200">
                          {formatBDT(item.costValuation)}
                        </td>

                        <td className="py-3 px-4">
                          {item.isOutOfStock ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-400 border border-red-800">
                              Out of Stock
                            </span>
                          ) : item.isLowStock ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
                              Low Stock Warning
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400">
                              Optimal
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              onClick={() => handleOpenAdjust(item)}
                              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                              title="Manual Stock In / Out"
                            >
                              <SlidersHorizontal size={12} className="text-[#ccff00]" />
                              <span>Adjust</span>
                            </button>

                            <button
                              onClick={() => handleOpenReconcile(item)}
                              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                              title="Reconcile Physical Stock"
                            >
                              <RotateCcw size={12} className="text-amber-400" />
                              <span>Reconcile</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <span>Page {page} of {totalPages || 1}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 bg-neutral-800 text-white rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 bg-neutral-800 text-white rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB CONTENT: STOCK MOVEMENT LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ledger by SKU, order, or reason..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#ccff00]"
              />
            </div>

            <select
              value={ledgerType}
              onChange={(e) => {
                setLedgerType(e.target.value);
                setPage(1);
              }}
              className="bg-neutral-900 border border-neutral-800 text-white text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
            >
              <option value="all">All Movement Reasons</option>
              <option value="initial">Initial Opening Stock</option>
              <option value="purchase">Supplier Purchase Receipt</option>
              <option value="sale">Customer Order Sale</option>
              <option value="return">Customer Return Restock</option>
              <option value="damage">Damaged Write-off</option>
              <option value="reconciliation">Physical Reconciliation</option>
              <option value="adjustment">Manual Adjustment</option>
            </select>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/80 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp (Dhaka)</th>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Quantity Delta</th>
                    <th className="py-3 px-4">Balance After</th>
                    <th className="py-3 px-4">Unit Cost</th>
                    <th className="py-3 px-4">Reason & Reference</th>
                    <th className="py-3 px-4">Responsible Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-500">
                        Loading audit ledger entries...
                      </td>
                    </tr>
                  ) : ledgerEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-500">
                        No ledger movements found.
                      </td>
                    </tr>
                  ) : (
                    ledgerEntries.map((entry) => {
                      const isPositive = entry.quantityDelta > 0;
                      return (
                        <tr key={entry.movementId} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-[10px] text-neutral-400">
                            {new Date(entry.timestamp).toLocaleDateString('en-GB', {
                              timeZone: 'Asia/Dhaka',
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-white max-w-xs truncate">{entry.productTitle}</div>
                            <div className="font-mono text-[10px] text-neutral-400">{entry.sku}</div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-950 border border-neutral-800 text-neutral-300">
                              {entry.type}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`font-mono font-bold text-sm ${
                                isPositive ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {isPositive ? `+${entry.quantityDelta}` : entry.quantityDelta}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {entry.balanceAfter}
                          </td>

                          <td className="py-3 px-4 font-mono text-neutral-400">
                            {formatBDT(entry.unitCost || 0)}
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-neutral-200">{entry.reason}</div>
                            {entry.referenceId && (
                              <div className="font-mono text-[10px] text-neutral-500">
                                Ref: {entry.referenceId}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 font-medium text-neutral-400">
                            {entry.actor}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <span>Page {page} of {totalPages || 1}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 bg-neutral-800 text-white rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 bg-neutral-800 text-white rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MANUAL ADJUSTMENT MODAL */}
      {adjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-black uppercase font-mono text-white">
                Stock Adjustment: {selectedProduct.sku}
              </h3>
              <button onClick={() => setAdjustModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitAdjustment} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="text-neutral-400">Selected Product:</div>
                <div className="font-bold text-white text-sm mt-0.5">{selectedProduct.title}</div>
                <div className="text-neutral-400 mt-1 flex justify-between">
                  <span>Current Physical Balance:</span>
                  <strong className="text-[#ccff00] font-mono">{selectedProduct.stock} units</strong>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold uppercase mb-1">Adjustment Type</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="adjustment">General Adjustment (Correction)</option>
                  <option value="damage">Damaged Goods Write-off</option>
                  <option value="return">Customer Return Restock</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold uppercase mb-1">
                  Quantity Delta (+/- Integer)
                </label>
                <input
                  type="number"
                  required
                  value={adjustmentDelta}
                  onChange={(e) => setAdjustmentDelta(parseInt(e.target.value, 10) || 0)}
                  placeholder="e.g. +5 or -2"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#ccff00]"
                />
                <span className="text-[10px] text-neutral-500 mt-0.5 block">
                  Resulting balance: {selectedProduct.stock + adjustmentDelta} units
                </span>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold uppercase mb-1">
                  Mandatory Audit Reason *
                </label>
                <textarea
                  required
                  rows={2}
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g., Cracked blade toe discovered during pre-dispatch inspection..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#ccff00]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust || adjustmentDelta === 0 || !adjustmentReason.trim()}
                  className="px-5 py-2 bg-[#ccff00] hover:bg-[#b5e600] text-black font-black uppercase rounded-xl cursor-pointer disabled:opacity-40"
                >
                  {isSubmittingAdjust ? 'Applying...' : 'Apply Stock Delta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. PHYSICAL RECONCILIATION MODAL */}
      {reconModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-black uppercase font-mono text-white">
                Physical Inventory Stocktake
              </h3>
              <button onClick={() => setReconModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitReconcile} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="text-neutral-400">Product:</div>
                <div className="font-bold text-white text-sm mt-0.5">{selectedProduct.title}</div>
                <div className="text-neutral-400 mt-1 flex justify-between">
                  <span>System Recorded Balance:</span>
                  <strong className="text-white font-mono">{selectedProduct.stock} units</strong>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold uppercase mb-1">
                  Actual Physical Counted Stock
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={physicalCount}
                  onChange={(e) => setPhysicalCount(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#ccff00]"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Discrepancy: {physicalCount - selectedProduct.stock > 0 ? '+' : ''}
                  {physicalCount - selectedProduct.stock} units
                </span>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold uppercase mb-1">
                  Reconciliation Audit Notes
                </label>
                <textarea
                  rows={2}
                  value={reconReason}
                  onChange={(e) => setReconReason(e.target.value)}
                  placeholder="e.g. End of month physical audit verified by warehouse lead..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReconModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRecon}
                  className="px-5 py-2 bg-[#ccff00] hover:bg-[#b5e600] text-black font-black uppercase rounded-xl cursor-pointer disabled:opacity-40"
                >
                  {isSubmittingRecon ? 'Reconciling...' : 'Commit Reconciliation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
