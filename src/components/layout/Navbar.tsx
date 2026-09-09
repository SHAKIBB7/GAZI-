"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Shield,
  Award,
  Zap,
  PhoneCall,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { CRICKET_CATEGORIES, CRICKET_BRANDS, CRICKET_PRODUCTS } from "@/lib/data/cricket-products";

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState(false);

  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  // Search results preview
  const searchResults = searchQuery.trim().length > 1
    ? CRICKET_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-11 h-11 rounded-xl cricket-gradient flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              🏏
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  CRICKET<span className="text-cricket-pitch">STORE</span>
                </span>
                <span className="bg-cricket-gold text-white text-[10px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider">
                  PRO
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
                Enterprise Multi-Vendor Hub
              </p>
            </div>
          </Link>

          {/* Mega Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search English Willow bats, match balls, Kookaburra, SS, Shakib gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                className="w-full bg-slate-50 border border-slate-300 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-cricket-pitch focus:ring-2 focus:ring-cricket-pitch/20 transition-all text-slate-800"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full cricket-gradient text-white flex items-center justify-center hover:opacity-95 transition-opacity"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Search Instant Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>PRODUCTS MATCHING &ldquo;{searchQuery}&rdquo;</span>
                  <span className="text-cricket-pitch">Sub-50ms Fast Search</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center text-xl overflow-hidden">
                        🏏
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.brand.name} • {item.category.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-cricket-pitch">
                          ৳{(item.discountPrice || item.basePrice).toLocaleString()}
                        </p>
                        {item.discountPrice && (
                          <p className="text-xs line-through text-slate-400">
                            ৳{item.basePrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/products?search=${encodeURIComponent(searchQuery)}`}
                  className="block p-3 text-center text-xs font-bold text-cricket-pitch hover:bg-cricket-pitch/5 transition-colors border-t border-slate-100"
                >
                  View All Matching Cricket Gear →
                </Link>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/admin"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:border-cricket-pitch hover:text-cricket-pitch transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>

            <Link
              href="/seller"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-cricket-gold" />
              <span>Seller Hub</span>
            </Link>

            <Link
              href="/wishlist"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 text-slate-700 transition-colors relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-full cricket-gradient text-white shadow-sm hover:opacity-95 transition-opacity"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-cricket-leather text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline">Bag</span>
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Categories Bar (Desktop) */}
        <nav className="hidden lg:flex items-center justify-between border-t border-slate-100 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <div className="flex items-center gap-6">
            <Link
              href="/products?category=cricket-bats"
              className="flex items-center gap-1 hover:text-cricket-pitch transition-colors py-1 text-cricket-pitch font-black"
            >
              Cricket Bats <ChevronDown className="w-3 h-3" />
            </Link>
            <Link href="/products?category=cricket-balls" className="hover:text-cricket-pitch transition-colors py-1">
              Match Balls
            </Link>
            <Link href="/products?category=batting-equipment" className="hover:text-cricket-pitch transition-colors py-1">
              Batting Pads & Gloves
            </Link>
            <Link href="/products?category=wicket-keeping" className="hover:text-cricket-pitch transition-colors py-1">
              Wicket Keeping
            </Link>
            <Link href="/products?category=cricket-shoes" className="hover:text-cricket-pitch transition-colors py-1">
              Spikes & Turf Shoes
            </Link>
            <Link href="/players" className="flex items-center gap-1 text-cricket-gold hover:text-amber-700 transition-colors py-1">
              <Zap className="w-3.5 h-3.5 fill-cricket-gold" />
              Shop by Player
            </Link>
          </div>

          <div className="flex items-center gap-5 font-semibold capitalize text-xs">
            <Link href="/products?filter=flash-sale" className="text-cricket-leather font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cricket-leather animate-ping" />
              Flash Sale
            </Link>
            <Link href="/knocking-service" className="text-slate-600 hover:text-cricket-pitch">
              Pro Knocking Lab
            </Link>
            <Link href="/bulk-orders" className="text-slate-600 hover:text-cricket-pitch">
              Academy & Club Orders
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search bats, balls, gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2.5 text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-800">
            <Link href="/products?category=cricket-bats" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-slate-100">
              🏏 Cricket Bats (English & Kashmir Willow)
            </Link>
            <Link href="/products?category=cricket-balls" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-slate-100">
              🔴 Match & Practice Balls
            </Link>
            <Link href="/products?category=batting-equipment" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-slate-100">
              🛡️ Pads, Gloves & Helmets
            </Link>
            <Link href="/players" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-slate-100 text-cricket-gold font-bold">
              ⚡ Shop by Player (Shakib, Kohli, Babar)
            </Link>
            <Link href="/products?filter=flash-sale" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-slate-100 text-cricket-leather font-bold">
              🔥 Flash Sale
            </Link>
            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-slate-100 text-slate-600">
              🛡️ Admin Dashboard
            </Link>
            <Link href="/seller" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-amber-700">
              🏪 Seller Hub (Multi-Vendor)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
