"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import { formatBDT } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [selectedTab, setSelectedTab] = useState<"orders" | "sellers" | "products">("orders");

  // Sample Admin KPIs
  const stats = [
    { label: "Total Platform Revenue", value: "৳1,842,500", change: "+18.4%", icon: TrendingUp, positive: true },
    { label: "Active Orders", value: "48 Orders", change: "+12 today", icon: Package, positive: true },
    { label: "Verified Multi-Vendor Sellers", value: "16 Sellers", change: "3 Pending KYC", icon: Users, positive: false },
    { label: "Low Stock Willow Bats", value: "4 Items", change: "Requires Restock", icon: AlertTriangle, positive: false },
  ];

  // Sample Orders
  const [orders, setOrders] = useState([
    {
      id: "CSP-2026-8921",
      customer: "Tanvir Ahmed",
      item: "SS Master 9000 Player Edition",
      knocking: true,
      amount: 31400,
      status: "PROCESSING",
      gateway: "bKash PGW",
      date: "Today, 18:24",
    },
    {
      id: "CSP-2026-8920",
      customer: "Mahmudur Rahman",
      item: "Kookaburra Turf White Match Ball (Box of 6)",
      knocking: false,
      amount: 14880,
      status: "SHIPPED",
      gateway: "SSLCommerz",
      date: "Today, 14:10",
    },
    {
      id: "CSP-2026-8919",
      customer: "Rashedul Karim",
      item: "MRF Genius Grand Edition (Virat Kohli)",
      knocking: true,
      amount: 46000,
      status: "DELIVERED",
      gateway: "Cash on Delivery",
      date: "Yesterday",
    },
    {
      id: "CSP-2026-8918",
      customer: "Fahim Hasan",
      item: "Masuri E-Line Pro Titanium Helmet",
      knocking: false,
      amount: 19580,
      status: "PROCESSING",
      gateway: "Nagad",
      date: "Yesterday",
    },
  ]);

  // Sample Sellers Waiting Approval
  const pendingSellers = [
    { name: "Willow Craft Bangladesh", owner: "Nazmul Islam", city: "Dhaka", tradeLicense: "TRAD/DSCC/049182", appliedDate: "2 days ago" },
    { name: "Chattogram Sports Hub", owner: "Farhan Chowdhury", city: "Chattogram", tradeLicense: "TRAD/CCC/109482", appliedDate: "3 days ago" },
  ];

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-cricket-pitch text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                ADMIN CONSOLE
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Cricket Store Pro Enterprise
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Admin Operations & Analytics
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              View Live Storefront
            </Link>
            <button
              onClick={() => alert("Simulating catalog index refresh with Meilisearch")}
              className="px-4 py-2 cricket-gradient text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Sync Meilisearch Catalog
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-500">{s.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{s.value}</h3>
                  <span
                    className={`inline-block text-[11px] font-bold mt-1 ${
                      s.positive ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {s.change}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-bold text-slate-600">
          <button
            onClick={() => setSelectedTab("orders")}
            className={`pb-3 transition-colors relative ${
              selectedTab === "orders"
                ? "text-cricket-pitch font-black border-b-2 border-cricket-pitch"
                : "hover:text-slate-900"
            }`}
          >
            Order Management ({orders.length})
          </button>
          <button
            onClick={() => setSelectedTab("sellers")}
            className={`pb-3 transition-colors relative ${
              selectedTab === "sellers"
                ? "text-cricket-pitch font-black border-b-2 border-cricket-pitch"
                : "hover:text-slate-900"
            }`}
          >
            Seller Approvals ({pendingSellers.length})
          </button>
        </div>

        {/* Tab Contents */}
        {selectedTab === "orders" ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Recent Customer Orders
              </h3>
              <span className="text-xs text-slate-500 font-semibold">Real-time Order Feed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Gear Ordered</th>
                    <th className="p-4">Lab Knocking</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Gateway</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{o.id}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{o.customer}</div>
                        <div className="text-[10px] text-slate-400">{o.date}</div>
                      </td>
                      <td className="p-4 max-w-xs truncate font-medium">{o.item}</td>
                      <td className="p-4">
                        {o.knocking ? (
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                            Yes (+৳1,500)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No</span>
                        )}
                      </td>
                      <td className="p-4 font-black text-slate-900">{formatBDT(o.amount)}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-[10px]">
                          {o.gateway}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            o.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : o.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => updateOrderStatus(o.id, "PROCESSING")}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold"
                        >
                          Process
                        </button>
                        <button
                          onClick={() => updateOrderStatus(o.id, "SHIPPED")}
                          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold"
                        >
                          Ship
                        </button>
                        <button
                          onClick={() => updateOrderStatus(o.id, "DELIVERED")}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold"
                        >
                          Deliver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Pending Multi-Vendor KYC Verifications
            </h3>
            <div className="divide-y divide-slate-100">
              {pendingSellers.map((s, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                    <p className="text-xs text-slate-500">
                      Owner: {s.owner} • {s.city} • Trade Lic: {s.tradeLicense}
                    </p>
                    <span className="text-[10px] text-slate-400">Applied {s.appliedDate}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`Approved ${s.name}`)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm"
                    >
                      Approve Merchant
                    </button>
                    <button
                      onClick={() => alert(`Review requested for ${s.name}`)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                    >
                      Inspect Documents
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
