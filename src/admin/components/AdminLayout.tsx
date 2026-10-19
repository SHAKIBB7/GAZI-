import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { OverviewTab } from '../tabs/OverviewTab';
import { ProductsTab } from '../tabs/ProductsTab';
import { InventoryTab } from '../tabs/InventoryTab';
import { OrdersTab } from '../tabs/OrdersTab';
import { PurchasesTab } from '../tabs/PurchasesTab';
import { CustomersTab } from '../tabs/CustomersTab';
import { ExpensesTab } from '../tabs/ExpensesTab';
import { ReportsTab } from '../tabs/ReportsTab';
import { AuditLogsTab } from '../tabs/AuditLogsTab';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Building2,
  Users,
  DollarSign,
  FileText,
  ShieldCheck,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Bell,
  Sparkles,
} from 'lucide-react';

interface AdminLayoutProps {
  onReturnToStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onReturnToStore }) => {
  const { user, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory & Ledger', icon: Layers },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'purchases', label: 'Purchases & Suppliers', icon: Building2 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Financial & Sales Reports', icon: FileText },
    { id: 'expenses', label: 'Operating Expenses', icon: DollarSign },
    { id: 'auditLogs', label: 'Security & Audit Logs', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-black border-b border-neutral-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ccff00] text-black font-mono font-black flex items-center justify-center text-sm">
            GZ
          </div>
          <span className="font-mono font-black text-sm uppercase tracking-tight text-white">
            Gazi Admin Portal
          </span>
        </div>

        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 bg-neutral-900 text-neutral-300 rounded-xl"
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          isMobileNavOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-black border-r border-neutral-800 p-4 md:sticky md:top-0 md:h-screen z-30 shrink-0`}
      >
        {/* Brand identity */}
        <div className="hidden md:flex items-center space-x-3 pb-6 mb-4 border-b border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-[#ccff00] text-black font-mono font-black flex items-center justify-center text-lg shadow-lg shadow-[#ccff00]/10">
            GZ
          </div>
          <div>
            <h1 className="font-mono font-black text-sm uppercase tracking-tight text-white leading-tight">
              GAZI ENTERPRISE
            </h1>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">
              Cricket Management
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileNavOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-black' : 'text-neutral-400'} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Return to Customer Store */}
        <div className="pt-4 mt-4 border-t border-neutral-800 space-y-2">
          <button
            onClick={onReturnToStore}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-neutral-800"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink size={14} className="text-[#ccff00]" />
              <span>Customer Storefront</span>
            </span>
            <ChevronRight size={14} className="text-neutral-500" />
          </button>

          {/* Admin user info & logout */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="font-bold text-white text-xs truncate">{user?.name || user?.username}</div>
              <span className="text-[10px] text-[#ccff00] font-mono uppercase block">
                {user?.role}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Administrative Workspace Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 bg-neutral-950 border-b border-neutral-800 sticky top-0 z-20">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-neutral-500 font-mono">Gazi Admin</span>
            <span className="text-neutral-600">/</span>
            <span className="text-white font-bold capitalize">
              {navigationItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-xs text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Dhaka Hub (Asia/Dhaka) • BDT (৳)</span>
            </div>

            <button
              onClick={onReturnToStore}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 text-[#ccff00] hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-neutral-800 cursor-pointer flex items-center space-x-1.5"
            >
              <span>View Storefront</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {activeTab === 'overview' && <OverviewTab onNavigateTab={(t) => setActiveTab(t)} />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'inventory' && <InventoryTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'purchases' && <PurchasesTab />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'expenses' && <ExpensesTab />}
          {activeTab === 'auditLogs' && <AuditLogsTab />}
        </div>
      </main>
    </div>
  );
};
