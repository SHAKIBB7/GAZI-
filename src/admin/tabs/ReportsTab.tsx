import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { FinancialReport } from '../types';
import { formatBDT } from '../../utils/bangladesh';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  HelpCircle,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export const ReportsTab: React.FC = () => {
  const [period, setPeriod] = useState<string>('thisMonth');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    setIsLoading(true);
    const res = await adminApi.getFinancialReport({
      period,
      startDate: customStart || undefined,
      endDate: customEnd || undefined,
    });
    if (res.data) {
      setReport(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  const m = report?.metrics;

  return (
    <div className="space-y-6">
      {/* 1. Header & Period Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-black uppercase font-mono text-white">
            Financial Performance & Profit Analytics
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Documented P&L Income Statement, COGS valuation & outstanding COD reconciliation (Asia/Dhaka)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 text-white text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-[#ccff00] cursor-pointer"
          >
            <option value="today">Today (আজ)</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days (গত ৭ দিন)</option>
            <option value="thisMonth">This Month (চলতি মাস)</option>
            <option value="lastMonth">Last Month</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {period === 'custom' && (
            <div className="flex items-center space-x-1.5 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 text-white px-2 py-1.5 rounded-lg"
              />
              <span className="text-neutral-500">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 text-white px-2 py-1.5 rounded-lg"
              />
              <button
                onClick={fetchReport}
                className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-3 py-1.5 rounded-lg"
              >
                Apply
              </button>
            </div>
          )}

          <a
            href={`/api/admin/reports/export/csv?period=${period}${customStart ? `&startDate=${customStart}` : ''}${customEnd ? `&endDate=${customEnd}` : ''}`}
            download
            className="bg-[#ccff00] hover:bg-[#b5e600] text-black text-xs font-black uppercase px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV Report</span>
          </a>
        </div>
      </div>

      {/* 2. Formal Income Statement Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex justify-between items-center bg-black">
          <div>
            <h3 className="text-sm font-black uppercase font-mono text-white">
              Income Statement (Profit & Loss)
            </h3>
            <span className="text-[11px] text-neutral-400 font-mono">
              Period: {report?.dateRange?.start?.split('T')[0]} to {report?.dateRange?.end?.split('T')[0]} • Timezone: Asia/Dhaka
            </span>
          </div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
            Standard GAAP / Minor-unit BDT (৳)
          </span>
        </div>

        <div className="p-5 space-y-4 font-mono text-xs">
          {/* Revenue Section */}
          <div className="space-y-2 pb-4 border-b border-neutral-800">
            <div className="font-bold uppercase tracking-wider text-neutral-400 font-sans text-xs">
              1. Sales Revenue
            </div>

            <div className="flex justify-between items-center text-neutral-300">
              <span className="flex items-center space-x-2 font-sans">
                <span>Gross Equipment Sales</span>
                <span className="text-[10px] text-neutral-500 font-mono">(Item list prices before coupons)</span>
              </span>
              <span className="font-bold text-white text-sm">{formatBDT(m?.grossSalesBdt || 0)}</span>
            </div>

            <div className="flex justify-between items-center text-neutral-400">
              <span className="flex items-center space-x-2 font-sans">
                <span>(-) Promotional Discounts</span>
                <span className="text-[10px] text-neutral-500 font-mono">(CRICKET10 vouchers)</span>
              </span>
              <span className="text-emerald-400">-{formatBDT(m?.discountsBdt || 0)}</span>
            </div>

            <div className="flex justify-between items-center text-neutral-400">
              <span className="flex items-center space-x-2 font-sans">
                <span>(-) Customer Returns & Refunds</span>
                <span className="text-[10px] text-neutral-500 font-mono">({m?.returnsCount || 0} returned order[s])</span>
              </span>
              <span className="text-red-400">-{formatBDT(m?.returnsValueBdt || 0)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-neutral-850 font-bold text-sm text-white">
              <span className="font-sans">(=) Net Equipment Sales Revenue</span>
              <span className="text-[#ccff00] text-base">{formatBDT(m?.netSalesBdt || 0)}</span>
            </div>
          </div>

          {/* Cost of Goods Sold Section */}
          <div className="space-y-2 pb-4 border-b border-neutral-800">
            <div className="font-bold uppercase tracking-wider text-neutral-400 font-sans text-xs">
              2. Cost of Sales
            </div>

            <div className="flex justify-between items-center text-neutral-300">
              <span className="flex items-center space-x-2 font-sans">
                <span>Cost of Goods Sold (COGS)</span>
                <span className="text-[10px] text-neutral-500 font-mono">(Historical acquisition unit cost snapshot)</span>
              </span>
              <span className="text-neutral-300 text-sm">-{formatBDT(m?.cogsBdt || 0)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-neutral-850 font-bold text-sm text-emerald-400">
              <span className="font-sans">(=) Gross Operating Profit</span>
              <span className="text-base">
                {formatBDT(m?.grossProfitBdt || 0)}
                <span className="text-xs font-normal text-emerald-500 ml-2">
                  (Gross Margin: {m?.grossMarginPercent || 0}%)
                </span>
              </span>
            </div>
          </div>

          {/* Operating Overheads Section */}
          <div className="space-y-2 pb-4 border-b border-neutral-800">
            <div className="font-bold uppercase tracking-wider text-neutral-400 font-sans text-xs">
              3. Operating Overheads
            </div>

            <div className="flex justify-between items-center text-neutral-300">
              <span className="flex items-center space-x-2 font-sans">
                <span>Total Operating Expenses</span>
                <span className="text-[10px] text-neutral-500 font-mono">(Warehouse rent, couriers, ads, packaging)</span>
              </span>
              <span className="text-amber-300 text-sm">-{formatBDT(m?.operatingExpensesBdt || 0)}</span>
            </div>
          </div>

          {/* Net Operating Profit Bottom Line */}
          <div className="p-4 bg-black rounded-xl border border-neutral-800 flex justify-between items-center">
            <div>
              <div className="font-black font-sans text-base text-white uppercase tracking-wider">
                (=) Estimated Net Operating Profit
              </div>
              <div className="text-[11px] text-neutral-400 font-sans">
                Gross Profit minus Total Operating Expenses
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black font-mono text-[#ccff00]">
                {formatBDT(m?.netOperatingProfitBdt || 0)}
              </span>
              <div className="text-[11px] text-neutral-400">
                Net Margin: <strong className="text-white">{m?.netProfitMarginPercent || 0}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cash Flow & Outstanding COD Audit Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cash Collected vs In Transit */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-black uppercase font-mono text-white flex items-center space-x-2">
            <DollarSign size={16} className="text-[#ccff00]" />
            <span>Cash Collection & Settlements</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center">
              <div>
                <span className="text-neutral-400 block">Cash Actually Collected & Settled:</span>
                <span className="text-[10px] text-neutral-500 block">
                  Online payments + courier-remitted COD payouts
                </span>
              </div>
              <span className="text-lg font-black font-mono text-emerald-400">
                {formatBDT(m?.collectedPaymentsBdt || 0)}
              </span>
            </div>

            <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center">
              <div>
                <span className="text-neutral-400 block">Outstanding Courier COD Settlements:</span>
                <span className="text-[10px] text-amber-400/90 block">
                  {m?.outstandingCodOrdersCount || 0} delivered/shipped order(s) awaiting courier cash
                </span>
              </div>
              <span className="text-lg font-black font-mono text-amber-300">
                {formatBDT(m?.outstandingCodSettlementsBdt || 0)}
              </span>
            </div>

            <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex justify-between items-center text-[11px] text-neutral-400">
              <span>Cancelled Orders Excluded From Revenue:</span>
              <strong className="text-red-400 font-mono">{m?.cancelledOrdersCount || 0} orders ({formatBDT(m?.cancelledValueBdt || 0)})</strong>
            </div>
          </div>
        </div>

        {/* Volume & Order Metrics */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-black uppercase font-mono text-white flex items-center space-x-2">
            <TrendingUp size={16} className="text-[#ccff00]" />
            <span>Equipment Order Statistics</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Total Orders Placed</span>
              <span className="text-xl font-black font-mono text-white mt-1 block">
                {m?.allOrdersCount || 0}
              </span>
              <span className="text-[10px] text-neutral-500">Gross order volume</span>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Valid Completed Orders</span>
              <span className="text-xl font-black font-mono text-[#ccff00] mt-1 block">
                {m?.totalOrdersCount || 0}
              </span>
              <span className="text-[10px] text-neutral-500">Excludes cancellations</span>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 col-span-2">
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Average Order Value (AOV)</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {formatBDT(m?.averageOrderValueBdt || 0)}
              </span>
              <span className="text-[10px] text-neutral-500">
                Formula: Net Sales (৳{m?.netSalesBdt || 0}) ÷ Valid Orders ({m?.totalOrdersCount || 0})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Best-Selling Products Table */}
      {report?.bestSellers && report.bestSellers.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase font-mono text-white flex items-center space-x-2">
              <Package size={16} className="text-[#ccff00]" />
              <span>Best-Selling Cricket Equipment ({period})</span>
            </h3>
            <span className="text-xs text-neutral-400 font-mono">Ranked by units sold</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Equipment & SKU</th>
                  <th className="py-3 px-4 text-center">Units Sold</th>
                  <th className="py-3 px-4">Gross Revenue</th>
                  <th className="py-3 px-4">Generated Gross Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                {report.bestSellers.map((item, i) => (
                  <tr key={item.productId} className="hover:bg-neutral-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{item.title}</div>
                      <div className="font-mono text-[10px] text-neutral-400">{item.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-white text-sm">
                      {item.unitsSold} pcs
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {formatBDT(item.revenue)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      +{formatBDT(item.grossProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Documented Formulas Appendix */}
      <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 text-xs text-neutral-400 space-y-2">
        <div className="font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
          <HelpCircle size={14} className="text-[#ccff00]" />
          <span>Accounting Principles & Metric Formulas</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-[11px] text-neutral-400">
          <li><strong>Gross Sales:</strong> Sum of list price (unitPrice × quantity) across all non-cancelled, non-returned customer orders in the selected period.</li>
          <li><strong>Discounts:</strong> Promotional vouchers deducted from customer checkout (e.g., CRICKET10).</li>
          <li><strong>Net Sales Revenue:</strong> Gross Sales minus discounts and refunded/returned merchandise.</li>
          <li><strong>Cost of Goods Sold (COGS):</strong> Historical unit purchase cost snapshotted at time of sale × fulfilled quantities.</li>
          <li><strong>Gross Operating Profit:</strong> Net Sales minus COGS. Represents core equipment merchandising margin.</li>
          <li><strong>Operating Expenses:</strong> Sum of physical warehouse rent, courier freight, packaging materials, and digital advertising overheads.</li>
          <li><strong>Net Operating Profit:</strong> Gross Profit minus Operating Expenses. Reflects actual operating bottom line.</li>
          <li><strong>Outstanding COD:</strong> Delivered and shipped orders on Cash on Delivery where physical cash has not yet been remitted by Steadfast, Pathao, or RedX couriers.</li>
        </ul>
      </div>
    </div>
  );
};
