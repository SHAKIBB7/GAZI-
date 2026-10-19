import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { OrderAdmin } from '../types';
import { formatBDT } from '../../utils/bangladesh';
import {
  Search,
  ShoppingBag,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  XCircle,
  DollarSign,
  User,
  Phone,
  MapPin,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  X,
} from 'lucide-react';

export const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<OrderAdmin[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [fulfillmentStatus, setFulfillmentStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');

  // Selected Order Drawer / Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderAdmin | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [newFulfillmentStatus, setNewFulfillmentStatus] = useState('');
  const [courierInput, setCourierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');

  // Settle COD Modal
  const [settleCodModalOpen, setSettleCodModalOpen] = useState(false);
  const [isSettlingCod, setIsSettlingCod] = useState(false);

  // Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelRestock, setCancelRestock] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Print Invoice Modal
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    const res = await adminApi.getOrders({
      page,
      limit: 15,
      search,
      fulfillmentStatus,
      paymentStatus,
      paymentMethod,
    });
    if (res.data) {
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setSummary(res.data.summary);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, fulfillmentStatus, paymentStatus, paymentMethod]);

  const handleSelectOrder = (o: OrderAdmin) => {
    setSelectedOrder(o);
    setNewFulfillmentStatus(o.fulfillmentStatus || o.status);
    setCourierInput(o.courier || 'Steadfast Courier');
    setTrackingInput(o.trackingNumber || '');
    setStatusNote('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    const res = await adminApi.updateOrderStatus(selectedOrder.orderId, {
      fulfillmentStatus: newFulfillmentStatus,
      courier: courierInput,
      trackingNumber: trackingInput,
      note: statusNote,
    });
    setIsUpdatingStatus(false);
    if (res.data?.success) {
      setSelectedOrder(res.data.order);
      fetchOrders();
    } else {
      alert(res.error || 'Failed to update order status');
    }
  };

  const handleSettleCod = async () => {
    if (!selectedOrder) return;
    setIsSettlingCod(true);
    const res = await adminApi.updatePaymentStatus(selectedOrder.orderId, {
      paymentStatus: 'paid',
      paymentChannel: `${selectedOrder.courier} COD Cash Remittance`,
      note: 'Cash on delivery payment collected and remitted by courier partner',
    });
    setIsSettlingCod(false);
    setSettleCodModalOpen(false);

    if (res.data?.success) {
      setSelectedOrder(res.data.order);
      fetchOrders();
    } else {
      alert(res.error || 'Failed to settle COD');
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setIsCancelling(true);
    const res = await adminApi.cancelOrder(selectedOrder.orderId, {
      restock: cancelRestock,
      reason: cancelReason || 'Cancelled by staff in administrative console',
    });
    setIsCancelling(false);
    setCancelModalOpen(false);

    if (res.data?.success) {
      setSelectedOrder(res.data.order);
      fetchOrders();
    } else {
      alert(res.error || 'Failed to cancel order');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Orders KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Dispatch</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-amber-300">
            {summary?.pendingFulfillment || 0} Orders
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Awaiting phone confirmation or packaging
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>In Transit With Courier</span>
            <Truck size={16} className="text-blue-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-blue-300">
            {summary?.inTransit || 0} Orders
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Steadfast, Pathao & RedX networks
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Delivered & Completed</span>
            <CheckCircle size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-emerald-400">
            {summary?.delivered || 0} Orders
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Successfully received by cricketers
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Outstanding COD Cash</span>
            <DollarSign size={16} className="text-[#ccff00]" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-white">
            {formatBDT(summary?.unpaidCodAmountBdt || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {summary?.unpaidCodOrders || 0} COD orders awaiting courier payout
          </div>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, customer, phone (017...), or bKash TrxID..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ccff00]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Fulfillment Status */}
          <select
            value={fulfillmentStatus}
            onChange={(e) => {
              setFulfillmentStatus(e.target.value);
              setPage(1);
            }}
            className="bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All Fulfillment States</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing / Packing</option>
            <option value="shipped">Shipped (In Transit)</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>

          {/* Payment Status */}
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All Payment States</option>
            <option value="pending">Pending Payment (COD / Unpaid)</option>
            <option value="paid">Paid & Settled</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Payment Method */}
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
            className="bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="card">Cards / Online</option>
          </select>
        </div>
      </div>

      {/* 3. Orders Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer & Phone</th>
                <th className="py-3 px-4">Courier & Zone</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Total Amount (BDT)</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    Loading orders registry...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    No orders match current search and status filters.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isPaid = o.paymentStatus === 'paid';
                  const isDelivered = (o.fulfillmentStatus || o.status) === 'delivered';
                  const isCancelled = (o.fulfillmentStatus || o.status) === 'cancelled';

                  return (
                    <tr
                      key={o.orderId}
                      onClick={() => handleSelectOrder(o)}
                      className="hover:bg-neutral-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">{o.orderId}</div>
                        <div className="font-mono text-[10px] text-neutral-500">
                          {new Date(o.date).toLocaleDateString('en-GB', {
                            timeZone: 'Asia/Dhaka',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{o.customer?.fullName || 'Valued Cricketer'}</div>
                        <div className="font-mono text-[11px] text-neutral-400">{o.customer?.phone}</div>
                        <div className="text-[10px] text-neutral-500 truncate max-w-xs">
                          {o.customer?.division}, {o.customer?.district}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{o.courier || 'Steadfast Courier'}</div>
                        <div className="text-[10px] text-neutral-400">
                          {o.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka City' : 'Outside Dhaka'}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        {(o.items || []).reduce((s, it) => s + (it.quantity || 1), 0)} pcs
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">
                          {formatBDT(o.financials?.total || 0)}
                        </div>
                        <div className="text-[10px] text-neutral-500 uppercase">
                          {o.paymentMethod || 'COD'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isPaid
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {isPaid ? 'Paid & Settled' : 'Pending (Unpaid COD)'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isDelivered
                              ? 'bg-emerald-950 text-emerald-400'
                              : isCancelled
                              ? 'bg-red-950 text-red-400'
                              : 'bg-neutral-800 text-neutral-200'
                          }`}
                        >
                          {o.fulfillmentStatus || o.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOrder(o);
                          }}
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Details →
                        </button>
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

      {/* 4. Order Details Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-neutral-900 border-l border-neutral-800 h-full shadow-2xl flex flex-col z-10 overflow-hidden text-neutral-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-black">
              <div className="flex items-center space-x-2.5">
                <ShoppingBag size={20} className="text-[#ccff00]" />
                <div>
                  <h3 className="text-base font-black uppercase font-mono text-white">
                    Order #{selectedOrder.orderId}
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Tracking: {selectedOrder.trackingNumber}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setInvoiceModalOpen(true)}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                  title="Print Formal Invoice"
                >
                  <Printer size={16} />
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Status Update Actions Box */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-neutral-400">
                    Manage Order Status
                  </span>
                  <div className="space-x-2">
                    {selectedOrder.paymentStatus !== 'paid' && selectedOrder.paymentMethod === 'cod' && (
                      <button
                        onClick={() => setSettleCodModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase px-3 py-1 rounded-lg text-[11px] cursor-pointer"
                      >
                        Settle COD / Mark Paid
                      </button>
                    )}
                    {selectedOrder.fulfillmentStatus !== 'cancelled' && (
                      <button
                        onClick={() => setCancelModalOpen(true)}
                        className="bg-red-950 hover:bg-red-900 text-red-300 font-bold uppercase px-3 py-1 rounded-lg text-[11px] border border-red-800 cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-neutral-400 font-bold mb-1">Fulfillment State</label>
                    <select
                      value={newFulfillmentStatus}
                      onChange={(e) => setNewFulfillmentStatus(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none"
                    >
                      <option value="pending">Pending Phone Call</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing / Boxed</option>
                      <option value="shipped">Shipped (Handed to Courier)</option>
                      <option value="delivered">Delivered to Customer</option>
                      <option value="returned">Customer Returned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-bold mb-1">Courier Partner</label>
                    <select
                      value={courierInput}
                      onChange={(e) => setCourierInput(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none"
                    >
                      <option value="Steadfast Courier">Steadfast Courier</option>
                      <option value="Pathao Courier">Pathao Courier</option>
                      <option value="RedX Logistics">RedX Logistics</option>
                      <option value="Sundarban Courier Service">Sundarban Courier</option>
                      <option value="eCourier">eCourier</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Optional administrative timeline note..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-white focus:outline-none"
                  />
                  <button
                    disabled={isUpdatingStatus}
                    onClick={handleUpdateStatus}
                    className="bg-[#ccff00] hover:bg-[#b5e600] text-black font-black uppercase px-4 py-1.5 rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingStatus ? 'Saving...' : 'Update Status'}
                  </button>
                </div>
              </div>

              {/* Customer Profile Card */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center space-x-2 font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-850 pb-2">
                  <User size={15} className="text-[#ccff00]" />
                  <span>Cricketer Information</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-neutral-500 block">Full Name:</span>
                    <strong className="text-white text-sm">{selectedOrder.customer?.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Phone:</span>
                    <strong className="text-[#ccff00] font-mono text-sm">{selectedOrder.customer?.phone}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Division & District:</span>
                    <span className="text-neutral-300">{selectedOrder.customer?.division}, {selectedOrder.customer?.district}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Delivery Zone:</span>
                    <span className="text-neutral-300 font-semibold">
                      {selectedOrder.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳130)'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-neutral-500 block">Detailed Delivery Address:</span>
                    <span className="text-white">{selectedOrder.customer?.address}</span>
                  </div>
                </div>
              </div>

              {/* Order Items with Immutable Snapshots */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-850 pb-2">
                  <span>Equipment Line Items</span>
                  <span className="font-mono text-neutral-500">
                    {(selectedOrder.items || []).length} unique items
                  </span>
                </div>

                <div className="divide-y divide-neutral-900 space-y-3 pt-1">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=80&q=80'}
                          alt={item.title}
                          className="w-10 h-10 object-contain bg-neutral-900 rounded p-1 border border-neutral-800 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white max-w-xs truncate">{item.title}</div>
                          <div className="text-[10px] text-neutral-400">
                            Size: <strong className="text-neutral-200">{item.selectedSize}</strong> • SKU: <span className="font-mono">{item.sku}</span>
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            Snapshotted Unit Cost: {formatBDT(item.unitCost || 0)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-white">
                          {formatBDT(item.unitPrice * item.quantity)}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {item.quantity} × {formatBDT(item.unitPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials & Profit Breakdown */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Equipment Subtotal:</span>
                  <span className="text-white">{formatBDT(selectedOrder.financials?.subtotal || 0)}</span>
                </div>
                {selectedOrder.financials?.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount (CRICKET10):</span>
                    <span>-{formatBDT(selectedOrder.financials.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-400">
                  <span>Shipping Fee:</span>
                  <span className="text-white">{formatBDT(selectedOrder.financials?.shipping || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-neutral-850">
                  <span>Total Order Value:</span>
                  <span className="text-[#ccff00]">{formatBDT(selectedOrder.financials?.total || 0)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-900">
                  <span>Cost of Goods Sold (COGS):</span>
                  <span>{formatBDT(selectedOrder.financials?.cogs || 0)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-500 font-bold">
                  <span>Order Gross Profit:</span>
                  <span>
                    +{formatBDT((selectedOrder.financials?.total || 0) - (selectedOrder.financials?.shipping || 0) - (selectedOrder.financials?.cogs || 0))}
                  </span>
                </div>
              </div>

              {/* Order Timeline History */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
                <span className="font-bold uppercase tracking-wider text-neutral-400 block border-b border-neutral-850 pb-2">
                  Audit History & Activity Trail
                </span>
                <div className="space-y-2 pt-2">
                  {(selectedOrder.history || []).map((h, i) => (
                    <div key={i} className="flex items-start space-x-2 text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-white">{h.action}</span>
                        <span className="text-neutral-500 ml-1.5">by {h.actor}</span>
                        {h.note && <div className="text-neutral-400 italic mt-0.5">{h.note}</div>}
                        <div className="text-[10px] text-neutral-600 font-mono">
                          {new Date(h.timestamp).toLocaleDateString('en-GB', {
                            timeZone: 'Asia/Dhaka',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Settle COD Modal */}
      {settleCodModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-sm font-black uppercase font-mono text-white mb-2">
              Confirm COD Cash Settlement
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Have you received the cash remittance of <strong className="text-white font-mono">{formatBDT(selectedOrder.financials?.total || 0)}</strong> from <strong className="text-white">{selectedOrder.courier}</strong>?
            </p>
            <div className="flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setSettleCodModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSettlingCod}
                onClick={handleSettleCod}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase rounded-xl cursor-pointer"
              >
                {isSettlingCod ? 'Settling...' : 'Confirm Cash Received'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Cancel Order Modal */}
      {cancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-sm font-black uppercase font-mono text-red-400 mb-2">
              Cancel Order #{selectedOrder.orderId}
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Are you sure you want to cancel this order? This will exclude it from net revenue reports.
            </p>

            <div className="space-y-3 mb-5 text-xs">
              <label className="flex items-center space-x-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cancelRestock}
                  onChange={(e) => setCancelRestock(e.target.checked)}
                  className="rounded text-[#ccff00] focus:ring-0"
                />
                <div>
                  <span className="font-bold text-white block">Automatically restore inventory stock</span>
                  <span className="text-[10px] text-neutral-500 block">
                    Returns units back into Dhaka central hub available quantity
                  </span>
                </div>
              </label>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Cancellation Reason</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer changed mind, incorrect size selected..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl cursor-pointer"
              >
                Dismiss
              </button>
              <button
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-black uppercase rounded-xl cursor-pointer"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Printable Invoice View */}
      {invoiceModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="relative w-full max-w-2xl bg-white text-neutral-900 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:p-0">
            <div className="flex justify-between items-start pb-6 border-b border-neutral-200">
              <div>
                <div className="text-2xl font-black font-mono tracking-tight text-black">GAZI SPORTS</div>
                <div className="text-xs text-neutral-600 uppercase tracking-widest font-bold">
                  Premier Cricket Equipment Specialist • Bangladesh
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  Dhaka Hub, Mirpur-12, Dhaka 1216 • Phone: +880 1700-000000
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase text-neutral-500">Commercial Invoice</span>
                <div className="text-base font-black font-mono text-black">{selectedOrder.orderId}</div>
                <div className="text-[11px] text-neutral-600 font-mono">
                  {new Date(selectedOrder.date).toLocaleDateString('en-GB', {
                    timeZone: 'Asia/Dhaka',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-neutral-200 text-xs">
              <div>
                <span className="font-bold uppercase text-neutral-500 block mb-1">Delivered To:</span>
                <div className="font-bold text-sm text-black">{selectedOrder.customer?.fullName}</div>
                <div className="font-mono text-neutral-700">{selectedOrder.customer?.phone}</div>
                <div className="text-neutral-600 mt-0.5">{selectedOrder.customer?.address}</div>
                <div className="text-neutral-600">{selectedOrder.customer?.division}, {selectedOrder.customer?.district}</div>
              </div>

              <div>
                <span className="font-bold uppercase text-neutral-500 block mb-1">Logistics & Payment:</span>
                <div>Courier: <strong>{selectedOrder.courier}</strong></div>
                <div>Tracking: <span className="font-mono font-bold">{selectedOrder.trackingNumber}</span></div>
                <div>Payment Method: <span className="uppercase font-bold">{selectedOrder.paymentMethod}</span></div>
                <div>Status: <span className="uppercase font-bold text-emerald-700">{selectedOrder.paymentStatus}</span></div>
              </div>
            </div>

            {/* Line Items */}
            <div className="py-4">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 text-neutral-500 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-2">Item Description</th>
                    <th className="py-2">Size</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-bold text-neutral-900">{it.title}</td>
                      <td className="py-2.5 text-neutral-600">{it.selectedSize}</td>
                      <td className="py-2.5 text-center font-mono">{it.quantity}</td>
                      <td className="py-2.5 text-right font-mono">{formatBDT(it.unitPrice)}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{formatBDT(it.unitPrice * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="pt-3 border-t border-neutral-200 flex justify-end text-xs font-mono">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span>{formatBDT(selectedOrder.financials?.subtotal || 0)}</span>
                </div>
                {selectedOrder.financials?.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-{formatBDT(selectedOrder.financials.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery:</span>
                  <span>{formatBDT(selectedOrder.financials?.shipping || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-black pt-2 border-t border-neutral-300">
                  <span>Total Amount (BDT):</span>
                  <span>{formatBDT(selectedOrder.financials?.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Actions for modal */}
            <div className="mt-8 pt-4 border-t border-neutral-200 flex justify-between items-center print:hidden">
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl cursor-pointer text-xs font-bold"
              >
                Close
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-[#ccff00] rounded-xl cursor-pointer text-xs font-black uppercase flex items-center space-x-1.5"
              >
                <Printer size={15} />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
