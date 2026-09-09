"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  PackagePlus,
  DollarSign,
  TrendingUp,
  Boxes,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { formatBDT } from "@/lib/utils";

export default function SellerDashboardPage() {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productTitle, setProductTitle] = useState("");
  const [brand, setBrand] = useState("SS (Sareen Sports)");
  const [category, setCategory] = useState("Cricket Bats");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [products, setProducts] = useState([
    { id: "sp-1", name: "SS Master 9000 Player Edition", category: "Cricket Bats", price: 29900, stock: 8, status: "ACTIVE" },
    { id: "sp-2", name: "SS Matrix Pro Batting Gloves", category: "Batting Equipment", price: 5200, stock: 35, status: "ACTIVE" },
    { id: "sp-3", name: "SS Ton Master Kashmir Willow", category: "Cricket Bats", price: 8500, stock: 2, status: "LOW_STOCK" },
  ]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTitle || !price || !stock) return;
    const newProd = {
      id: `sp-${Date.now()}`,
      name: productTitle,
      category,
      price: parseFloat(price),
      stock: parseInt(stock),
      status: "ACTIVE",
    };
    setProducts([newProd, ...products]);
    setShowAddProductModal(false);
    setProductTitle("");
    setPrice("");
    setStock("");
    alert("Cricket product submitted to Admin moderation queue!");
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-cricket-gold text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                VERIFIED MERCHANT
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Sareen Sports Authorized Bangladesh Hub
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Seller Merchant Dashboard
            </h1>
          </div>

          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 cricket-gradient text-white rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>List New Cricket Product</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Gross Sales This Month</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">৳482,000</h3>
            <span className="text-[11px] font-bold text-emerald-600">+14.2% vs last month</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Net Merchant Payout</p>
            <h3 className="text-2xl font-black text-cricket-pitch mt-1">৳433,800</h3>
            <span className="text-[11px] font-semibold text-slate-400">After 10% platform commission</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Total Orders Fulfilled</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">128 Orders</h3>
            <span className="text-[11px] font-bold text-emerald-600">98.5% on-time dispatch</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Merchant Quality Rating</p>
            <h3 className="text-2xl font-black text-amber-500 mt-1">4.9 / 5.0</h3>
            <span className="text-[11px] font-semibold text-slate-400">Based on 145 ratings</span>
          </div>
        </div>

        {/* Listed Products Inventory Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Your Listed Cricket Equipment & Inventory
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{products.length} Products Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Listing Price</th>
                  <th className="p-4">Stock Units</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <span>🏏</span>
                      <span>{p.name}</span>
                    </td>
                    <td className="p-4 font-medium">{p.category}</td>
                    <td className="p-4 font-black text-slate-900">{formatBDT(p.price)}</td>
                    <td className="p-4">
                      <span className={`font-bold ${p.stock < 5 ? "text-cricket-leather" : "text-slate-800"}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => alert(`Edit stock for ${p.name}`)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-700"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
              <h3 className="text-lg font-black text-slate-900 mb-4">
                List New Cricket Product
              </h3>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SS Ton Vertu Player Edition Bat"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Brand
                    </label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-900"
                    >
                      <option value="SS">SS (Sareen Sports)</option>
                      <option value="Kookaburra">Kookaburra</option>
                      <option value="Gray-Nicolls">Gray-Nicolls</option>
                      <option value="CA Sports">CA Sports</option>
                      <option value="MRF">MRF</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-900"
                    >
                      <option value="Cricket Bats">Cricket Bats</option>
                      <option value="Cricket Balls">Cricket Balls</option>
                      <option value="Batting Equipment">Batting Equipment</option>
                      <option value="Wicket Keeping">Wicket Keeping</option>
                      <option value="Cricket Shoes">Cricket Shoes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Selling Price (BDT ৳) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 32000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Initial Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 10"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Note:</strong> All new equipment undergoes automated serial verification & admin compliance check before going live on the customer storefront.
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl cricket-gradient text-white font-bold shadow-md"
                  >
                    Submit for Approval
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
