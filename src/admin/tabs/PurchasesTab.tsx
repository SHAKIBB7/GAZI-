import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { Supplier, PurchaseOrder, ProductAdmin } from '../types';
import { formatBDT } from '../../utils/bangladesh';
import {
  Package,
  Plus,
  Building2,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  X,
  PlusCircle,
  Trash2,
  Clock,
  Layers,
} from 'lucide-react';

export const PurchasesTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'purchases' | 'suppliers'>('purchases');
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<ProductAdmin[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New PO Modal
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [poItems, setPoItems] = useState<Array<{ productId: string; sku: string; title: string; quantity: number; unitCost: number }>>([
    { productId: '', sku: '', title: '', quantity: 10, unitCost: 10000 },
  ]);
  const [additionalCosts, setAdditionalCosts] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [poNotes, setPoNotes] = useState<string>('');
  const [isSubmittingPO, setIsSubmittingPO] = useState(false);

  // Add Supplier Modal
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierCategories, setSupplierCategories] = useState('Cricket Bats, Batting Equipment');
  const [supplierNotes, setSupplierNotes] = useState('');
  const [isSubmittingSupplier, setIsSubmittingSupplier] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const [purchasesRes, suppliersRes, productsRes] = await Promise.all([
      adminApi.getPurchases(),
      adminApi.getSuppliers(),
      adminApi.getProducts({ limit: 100 }),
    ]);

    if (purchasesRes.data) {
      setPurchases(purchasesRes.data.purchases);
      setSummary(purchasesRes.data.summary);
    }
    if (suppliersRes.data) {
      setSuppliers(suppliersRes.data.suppliers);
    }
    if (productsRes.data) {
      setProducts(productsRes.data.products);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const newItems = [...poItems];
    newItems[index] = {
      productId: prod.id,
      sku: prod.sku,
      title: prod.title,
      quantity: newItems[index].quantity || 10,
      unitCost: prod.costPrice || 10000,
    };
    setPoItems(newItems);
  };

  const addPOLineItem = () => {
    setPoItems([...poItems, { productId: '', sku: '', title: '', quantity: 5, unitCost: 0 }]);
  };

  const removePOLineItem = (index: number) => {
    if (poItems.length <= 1) return;
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const submitPO = async (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    if (!sup) {
      alert('Please select a supplier');
      return;
    }
    if (poItems.some((it) => !it.productId || it.quantity <= 0)) {
      alert('Please select valid products and positive quantities for all lines');
      return;
    }

    setIsSubmittingPO(true);
    const res = await adminApi.createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      items: poItems,
      additionalCosts: Number(additionalCosts || 0),
      amountPaid: Number(amountPaid || 0),
      paymentReference: paymentRef,
      notes: poNotes,
      status: 'received',
    });
    setIsSubmittingPO(false);

    if (res.data?.success) {
      alert(res.data.message);
      setPoModalOpen(false);
      fetchData();
    } else {
      alert(res.error || 'Failed to create purchase order');
    }
  };

  const submitSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) return;

    setIsSubmittingSupplier(true);
    const res = await adminApi.saveSupplier({
      name: supplierName.trim(),
      contactPerson,
      phone: supplierPhone,
      email: supplierEmail,
      address: supplierAddress,
      categoriesSupplied: supplierCategories.split(',').map((c) => c.trim()),
      notes: supplierNotes,
    });
    setIsSubmittingSupplier(false);

    if (res.data?.success) {
      setSupplierModalOpen(false);
      fetchData();
    } else {
      alert(res.error || 'Failed to save supplier');
    }
  };

  const totalCalculatedPO = poItems.reduce((s, it) => s + (it.quantity * it.unitCost), 0) + Number(additionalCosts || 0);

  return (
    <div className="space-y-6">
      {/* 1. Procurement Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Cumulative Procurement</span>
            <Package size={16} className="text-[#ccff00]" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-white">
            {formatBDT(summary?.totalPurchasesAmountBdt || 0)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Total inventory acquired from UK, India & Australia
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Paid to Suppliers</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-emerald-400">
            {formatBDT(summary?.totalPaidBdt || 0)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Settled via SWIFT & foreign exchange transfer
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Outstanding Supplier Debt</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-amber-300">
            {formatBDT(summary?.totalBalanceDueBdt || 0)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Accounts payable under net trade credit terms
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab Switcher & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-2 rounded-2xl">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveSubTab('purchases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'purchases'
                ? 'bg-black text-[#ccff00] shadow-md border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Purchase Orders (Inward Stock)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'suppliers'
                ? 'bg-black text-[#ccff00] shadow-md border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Building2 size={14} />
            <span>Supplier Directory</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {activeSubTab === 'purchases' ? (
            <button
              onClick={() => {
                if (suppliers.length > 0) setSelectedSupplierId(suppliers[0].id);
                setPoModalOpen(true);
              }}
              className="bg-[#ccff00] hover:bg-[#b5e600] text-black text-xs font-black uppercase px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>Create Purchase Order (Stock In)</span>
            </button>
          ) : (
            <button
              onClick={() => setSupplierModalOpen(true)}
              className="bg-[#ccff00] hover:bg-[#b5e600] text-black text-xs font-black uppercase px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>Add New Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. SUB-TAB: PURCHASES TABLE */}
      {activeSubTab === 'purchases' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">PO Reference & Date</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Line Items</th>
                  <th className="py-3 px-4">Freight / Customs</th>
                  <th className="py-3 px-4">Total Amount (BDT)</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Amount Due</th>
                  <th className="py-3 px-4">Warehouse Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-500">
                      Loading procurement history...
                    </td>
                  </tr>
                ) : purchases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-500">
                      No purchase orders on file.
                    </td>
                  </tr>
                ) : (
                  purchases.map((po) => (
                    <tr key={po.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">{po.poNumber}</div>
                        <div className="font-mono text-[10px] text-neutral-500">
                          {new Date(po.date).toLocaleDateString('en-GB', {
                            timeZone: 'Asia/Dhaka',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{po.supplierName}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono">
                          {po.items.reduce((s, it) => s + (it.quantity || 0), 0)} units
                        </span>
                        <span className="text-[10px] text-neutral-400 block truncate max-w-xs">
                          {po.items.map((it) => it.title).join(', ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-neutral-400">
                        {formatBDT(po.additionalCosts || 0)}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {formatBDT(po.totalAmount)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            po.paymentStatus === 'paid'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : po.paymentStatus === 'partial'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {po.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-amber-300">
                        {formatBDT(po.balanceDue || 0)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 font-bold">
                          <CheckCircle size={12} />
                          <span>Stocked In</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB: SUPPLIERS DIRECTORY */}
      {activeSubTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm">{sup.name}</h4>
                  <div className="text-xs text-neutral-400 mt-0.5">{sup.contactPerson}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 text-[10px] font-mono border border-neutral-800">
                  {sup.id}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-300">
                {sup.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone size={13} className="text-[#ccff00]" />
                    <span className="font-mono">{sup.phone}</span>
                  </div>
                )}
                {sup.email && (
                  <div className="flex items-center space-x-2">
                    <Mail size={13} className="text-[#ccff00]" />
                    <span>{sup.email}</span>
                  </div>
                )}
                {sup.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={13} className="text-[#ccff00]" />
                    <span className="text-neutral-400">{sup.address}</span>
                  </div>
                )}
              </div>

              {sup.notes && (
                <p className="text-[11px] text-neutral-500 italic bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                  {sup.notes}
                </p>
              )}

              <div className="pt-2 border-t border-neutral-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase">Total Purchases:</span>
                  <strong className="text-white font-mono">{formatBDT(sup.totalPurchases || 0)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase">Balance Owed:</span>
                  <strong className="text-amber-300 font-mono">{formatBDT(sup.balanceOwed || 0)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. NEW PURCHASE ORDER MODAL */}
      {poModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-black uppercase font-mono text-white">
                  Create Inward Purchase Order
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Receiving stock will automatically increment warehouse balances and update Weighted Average Cost (WAC)
                </p>
              </div>
              <button onClick={() => setPoModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitPO} className="flex-1 overflow-y-auto mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-bold uppercase mb-1">Select Supplier *</label>
                <select
                  required
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.address})</option>
                  ))}
                </select>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-400 uppercase">Product Line Items</span>
                  <button
                    type="button"
                    onClick={addPOLineItem}
                    className="text-[#ccff00] hover:underline flex items-center space-x-1 cursor-pointer font-bold"
                  >
                    <PlusCircle size={14} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <label className="block text-[10px] text-neutral-500 mb-0.5">Product</label>
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => handleProductSelect(idx, e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-1.5 text-white text-[11px] focus:outline-none"
                        >
                          <option value="">-- Choose Equipment --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.title} ({p.sku})</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-neutral-500 mb-0.5">Quantity</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...poItems];
                            updated[idx].quantity = parseInt(e.target.value, 10) || 0;
                            setPoItems(updated);
                          }}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-1.5 text-white font-mono text-[11px]"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-neutral-500 mb-0.5">Unit Cost (BDT)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={item.unitCost}
                          onChange={(e) => {
                            const updated = [...poItems];
                            updated[idx].unitCost = parseFloat(e.target.value) || 0;
                            setPoItems(updated);
                          }}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-1.5 text-white font-mono text-[11px]"
                        />
                      </div>

                      <div className="col-span-1 text-right pt-4">
                        <button
                          type="button"
                          onClick={() => removePOLineItem(idx)}
                          className="text-neutral-500 hover:text-red-400 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial terms */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">
                    Freight & Customs Clearance (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={additionalCosts}
                    onChange={(e) => setAdditionalCosts(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold mb-1">
                    Amount Paid Upfront (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center font-mono text-xs">
                <span>Calculated PO Total:</span>
                <span className="text-base font-bold text-[#ccff00]">{formatBDT(totalCalculatedPO)}</span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPoModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPO}
                  className="px-5 py-2 bg-[#ccff00] hover:bg-[#b5e600] text-black font-black uppercase rounded-xl cursor-pointer disabled:opacity-40"
                >
                  {isSubmittingPO ? 'Stocking In...' : 'Confirm PO & Stock In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ADD SUPPLIER MODAL */}
      {supplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-black uppercase font-mono text-white">Add Equipment Supplier</h3>
              <button onClick={() => setSupplierModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitSupplier} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="e.g. Unicorn Products Ltd"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. David Roberts"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    placeholder="+44 115 985..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    value={supplierEmail}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                    placeholder="trade@..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Address / Origin</label>
                <input
                  type="text"
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  placeholder="Nottingham, UK or Jalandhar, India"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  placeholder="Terms, bank wire details..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSupplierModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSupplier}
                  className="px-5 py-2 bg-[#ccff00] hover:bg-[#b5e600] text-black font-black uppercase rounded-xl cursor-pointer disabled:opacity-40"
                >
                  {isSubmittingSupplier ? 'Saving...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
