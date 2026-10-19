import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { FinancialReport, OrderAdmin } from '../types';
import { formatBDT } from '../../utils/bangladesh';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  FileText,
  BadgePercent,
  Wallet,
} from 'lucide-react';

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddProduct?: () => void;
  onOpenStockAdjust?: () => void;
  onOpenRecordExpense?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  onNavigateTab,
  onOpenAddProduct,
  onOpenStockAdjust,
  onOpenRecordExpense,
}) => {
  const [period, setPeriod] = useState<string>('last7days');
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderAdmin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const [reportRes, ordersRes] = await Promise.all([
      adminApi.getFinancialReport({ period }),
      adminApi.getOrders({ limit: 6, sort: 'newest' }),
    ]);

    if (reportRes.data) {
      setReport(reportRes.data);
    }
    if (ordersRes.data?.orders) {
      setRecentOrders(ordersRes.data.orders);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const m = report?.metrics;

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header & Time Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse"></span>
            <h2 className="text-lg sm:text-xl font-black uppercase font-mono tracking-tight text-white">
              Executive Enterprise Overview
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time sales, inventory valuation, cost accounting & profit analytics (Asia/Dhaka)
          </p>
        </div>

        <div className="flex items-center space-x-2">
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
          </select>

          <button
            onClick={fetchDashboardData}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Urgent Low-Stock Banner (if any) */}
      {report?.lowStockProducts && report.lowStockProducts.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase font-mono">
                Inventory Replenishment Alert ({report.lowStockProducts.length} Equipment SKUs at Risk)
              </h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {report.lowStockProducts[0]?.title} has only {report.lowStockProducts[0]?.stock} unit(s) remaining in the Dhaka hub.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase px-4 py-2.5 rounded-xl tracking-wider transition-colors cursor-pointer shrink-0"
          >
            Manage Stock & Reconcile
          </button>
        </div>
      )}

      {/* 3. Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Net Sales */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Net Sales Revenue</span>
            <DollarSign size={16} className="text-[#ccff00]" />
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black font-mono text-white">
              {formatBDT(m?.netSalesBdt || 0)}
            </span>
            <div className="text-[11px] text-neutral-400 mt-1 flex items-center space-x-1">
              <span>Gross: {formatBDT(m?.grossSalesBdt || 0)}</span>
              {Boolean(m?.discountsBdt) && (
                <span className="text-emerald-400">(-{formatBDT(m?.discountsBdt || 0)})</span>
              )}
            </div>
          </div>
        </div>

        {/* Cost of Goods Sold (COGS) */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Cost of Goods Sold (COGS)</span>
            <Package size={16} className="text-neutral-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black font-mono text-neutral-300">
              {formatBDT(m?.cogsBdt || 0)}
            </span>
            <div className="text-[11px] text-neutral-500 mt-1">
              Historical purchase cost of goods sold
            </div>
          </div>
        </div>

        {/* Gross Operating Profit */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Gross Operating Profit</span>
            <BadgePercent size={16} className="text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {formatBDT(m?.grossProfitBdt || 0)}
            </span>
            <div className="text-[11px] text-emerald-500/90 mt-1 font-semibold">
              Gross Margin: {m?.grossMarginPercent || 0}%
            </div>
          </div>
        </div>

        {/* Net Operating Profit */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Net Operating Profit</span>
            <TrendingUp size={16} className="text-[#ccff00]" />
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black font-mono text-[#ccff00]">
              {formatBDT(m?.netOperatingProfitBdt || 0)}
            </span>
            <div className="text-[11px] text-neutral-400 mt-1">
              Expenses: -{formatBDT(m?.operatingExpensesBdt || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Cash Flow & Working Capital Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Collected Payments */}
        <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Settled / Collected Cash
            </span>
            <span className="text-lg font-black font-mono text-white">
              {formatBDT(m?.collectedPaymentsBdt || 0)}
            </span>
            <span className="text-[10px] text-emerald-400 block">
              Online upfront + verified COD cash
            </span>
          </div>
        </div>

        {/* Outstanding COD Settlements */}
        <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Truck size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Outstanding COD Settlements
            </span>
            <span className="text-lg font-black font-mono text-amber-300">
              {formatBDT(m?.outstandingCodSettlementsBdt || 0)}
            </span>
            <span className="text-[10px] text-neutral-400 block">
              {m?.outstandingCodOrdersCount || 0} order(s) awaiting courier remittance
            </span>
          </div>
        </div>

        {/* Total Orders & AOV */}
        <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 text-[#ccff00] flex items-center justify-center shrink-0">
            <ShoppingBag size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Fulfilled Orders & AOV
            </span>
            <span className="text-lg font-black font-mono text-white">
              {m?.totalOrdersCount || 0} Orders
            </span>
            <span className="text-[10px] text-neutral-400 block">
              Average Order Value: {formatBDT(m?.averageOrderValueBdt || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Quick Administrative Actions Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
          Quick Operational Actions
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigateTab('products')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} className="text-[#ccff00]" />
            <span>Add New Cricket Product</span>
          </button>

          <button
            onClick={() => onNavigateTab('purchases')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Package size={14} className="text-[#ccff00]" />
            <span>Stock-In Supplier Purchase</span>
          </button>

          <button
            onClick={() => onNavigateTab('expenses')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <DollarSign size={14} className="text-[#ccff00]" />
            <span>Record Operating Expense</span>
          </button>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} className="text-[#ccff00]" />
            <span>Warehouse Physical Stocktake</span>
          </button>

          <button
            onClick={() => onNavigateTab('reports')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <FileText size={14} className="text-[#ccff00]" />
            <span>Export Financial P&L Statement</span>
          </button>
        </div>
      </div>

      {/* 6. Period Sales & Profit Bar Graph */}
      {report?.timelineChart && report.timelineChart.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black uppercase font-mono text-white">
                Sales & Profit Trajectory ({period})
              </h3>
              <p className="text-[11px] text-neutral-400">
                Daily comparison of Net Sales vs Cost of Goods Sold
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#ccff00]"></span>
                <span className="text-neutral-300">Net Sales</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-neutral-600"></span>
                <span className="text-neutral-400">COGS</span>
              </span>
            </div>
          </div>

          <div className="h-44 flex items-end gap-2 pt-6 pb-2 px-2 overflow-x-auto">
            {report.timelineChart.map((day, idx) => {
              const maxVal = Math.max(
                ...report.timelineChart.map((d) => Math.max(d.netSales, d.cogs)),
                1000
              );
              const salesHeight = Math.max(6, Math.round((day.netSales / maxVal) * 120));
              const cogsHeight = Math.max(4, Math.round((day.cogs / maxVal) * 120));

              return (
                <div key={idx} className="flex-1 min-w-[36px] flex flex-col items-center justify-end h-full group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-neutral-700 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20">
                    <div>Sales: {formatBDT(day.netSales)}</div>
                    <div>COGS: {formatBDT(day.cogs)}</div>
                  </div>

                  <div className="w-full flex justify-center items-end gap-1 h-[120px]">
                    <div
                      style={{ height: `${salesHeight}px` }}
                      className="w-3 bg-[#ccff00] rounded-t transition-all group-hover:brightness-110"
                    />
                    <div
                      style={{ height: `${cogsHeight}px` }}
                      className="w-3 bg-neutral-600 rounded-t transition-all group-hover:brightness-125"
                    />
                  </div>

                  <span className="text-[9px] text-neutral-500 font-mono mt-2 truncate w-full text-center">
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Recent Orders Table Preview */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag size={18} className="text-[#ccff00]" />
            <h3 className="text-sm font-black uppercase font-mono text-white">
              Recent Equipment Orders
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-[#ccff00] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Delivery Zone</th>
                <th className="py-3 px-4">Total (BDT)</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.orderId} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white">{o.orderId}</div>
                      <div className="text-[10px] text-neutral-500">
                        {new Date(o.date).toLocaleDateString('en-GB', {
                          timeZone: 'Asia/Dhaka',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{o.customer?.fullName || 'Valued Cricketer'}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{o.customer?.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-neutral-300">
                        {o.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-white">
                        {formatBDT(o.financials?.total || 0)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.paymentStatus === 'paid'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {o.paymentStatus === 'paid' ? 'Paid' : 'Unpaid (COD)'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.fulfillmentStatus === 'delivered'
                            ? 'bg-emerald-950 text-emerald-400'
                            : o.fulfillmentStatus === 'cancelled'
                            ? 'bg-red-950 text-red-400'
                            : 'bg-neutral-800 text-neutral-200'
                        }`}
                      >
                        {o.fulfillmentStatus || o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
