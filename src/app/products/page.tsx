"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Filter,
  SlidersHorizontal,
  Star,
  Check,
  ShoppingCart,
  Shield,
  RotateCcw,
  X,
} from "lucide-react";
import {
  CRICKET_PRODUCTS,
  CRICKET_CATEGORIES,
  CRICKET_BRANDS,
  CRICKET_PLAYERS,
  CricketProduct,
} from "@/lib/data/cricket-products";
import { useCartStore } from "@/lib/store/cart-store";

function ProductsCatalogContent() {
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category") || "";
  const initialBrand = searchParams.get("brand") || "";
  const initialPlayer = searchParams.get("player") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialFilter = searchParams.get("filter") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [selectedPlayer, setSelectedPlayer] = useState<string>(initialPlayer);
  const [selectedWillowGrade, setSelectedWillowGrade] = useState<string>("");
  const [onlyKnockingReady, setOnlyKnockingReady] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [addedItemSlug, setAddedItemSlug] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return CRICKET_PRODUCTS.filter((product) => {
      // Search query
      if (initialSearch) {
        const query = initialSearch.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.name.toLowerCase().includes(query);
        const matchesCat = product.category.name.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesCat) return false;
      }

      // Flash sale filter
      if (initialFilter === "flash-sale" && !product.isFlashSale) {
        return false;
      }

      // Category filter
      if (selectedCategory && product.category.slug !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand && product.brand.slug !== selectedBrand) {
        return false;
      }

      // Player filter
      if (selectedPlayer && product.player?.slug !== selectedPlayer) {
        return false;
      }

      // Willow Grade filter (for bats)
      if (selectedWillowGrade) {
        if (!product.batSpecs) return false;
        if (!product.batSpecs.willowGrade.toLowerCase().includes(selectedWillowGrade.toLowerCase())) {
          return false;
        }
      }

      // Knocking ready filter
      if (onlyKnockingReady && !product.hasKnockingOption) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") {
        return (a.discountPrice || a.basePrice) - (b.discountPrice || b.basePrice);
      }
      if (sortBy === "price-desc") {
        return (b.discountPrice || b.basePrice) - (a.discountPrice || a.basePrice);
      }
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [
    initialSearch,
    initialFilter,
    selectedCategory,
    selectedBrand,
    selectedPlayer,
    selectedWillowGrade,
    onlyKnockingReady,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedPlayer("");
    setSelectedWillowGrade("");
    setOnlyKnockingReady(false);
    setSortBy("featured");
  };

  const handleQuickAdd = (product: CricketProduct) => {
    addItem(product, "Short Handle (SH)", "2lb 10oz", false);
    setAddedItemSlug(product.slug);
    setTimeout(() => setAddedItemSlug(null), 2000);
  };

  return (
    <div className="bg-slate-50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="text-xs text-slate-500 font-semibold mb-2">
            <Link href="/" className="hover:text-cricket-pitch">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-800">Cricket Catalog</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Cricket Equipment Catalog
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Showing {filteredProducts.length} verified pro items
              </p>
            </div>

            {/* Sort & Mobile Filter Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                <span className="text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent focus:outline-none font-bold text-slate-900"
                >
                  <option value="featured">Featured / Best Match</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Filter Sidebar */}
          <aside className={`lg:block ${isMobileFilterOpen ? "block" : "hidden"} space-y-6`}>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-cricket-pitch" />
                  <span>Faceted Filters</span>
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-cricket-pitch hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Knocking Ready Switch */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyKnockingReady}
                    onChange={(e) => setOnlyKnockingReady(e.target.checked)}
                    className="w-4 h-4 rounded text-cricket-pitch focus:ring-cricket-pitch"
                  />
                  <div>
                    <div className="text-xs font-bold text-amber-900">
                      Knocking Lab Service
                    </div>
                    <div className="text-[11px] text-amber-700">
                      Show only bats with pro knocking options
                    </div>
                  </div>
                </label>
              </div>

              {/* Categories Filter */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-wider">
                  Category
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg font-bold transition-colors ${
                      selectedCategory === ""
                        ? "bg-cricket-pitch text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    All Categories ({CRICKET_PRODUCTS.length})
                  </button>
                  {CRICKET_CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg font-medium transition-colors ${
                        selectedCategory === cat.slug
                          ? "bg-cricket-pitch text-white font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Willow Grade Filter (Specialized Cricket) */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-wider">
                  English Willow Grade
                </h4>
                <div className="space-y-1.5">
                  {[
                    { id: "", label: "All Grades" },
                    { id: "Grade 1+", label: "Grade 1+ Limited Reserve" },
                    { id: "Grade 1", label: "Grade 1 Unbleached" },
                    { id: "Grade 2", label: "Grade 2 English Willow" },
                    { id: "Kashmir", label: "Kashmir Willow" },
                  ].map((grade) => (
                    <button
                      key={grade.id}
                      onClick={() => setSelectedWillowGrade(grade.id)}
                      className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg font-medium transition-colors ${
                        selectedWillowGrade === grade.id
                          ? "bg-emerald-800 text-white font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {grade.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands Filter */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-wider">
                  Manufacturer Brand
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedBrand("")}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg font-bold transition-colors ${
                      selectedBrand === ""
                        ? "bg-cricket-pitch text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    All Brands
                  </button>
                  {CRICKET_BRANDS.map((b) => (
                    <button
                      key={b.slug}
                      onClick={() => setSelectedBrand(b.slug)}
                      className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                        selectedBrand === b.slug
                          ? "bg-cricket-pitch text-white font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{b.name}</span>
                      <span className="text-[10px] opacity-70">{b.country}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Endorsement Filter */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-wider">
                  Shop by Cricketer
                </h4>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedPlayer("")}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg font-bold transition-colors ${
                      selectedPlayer === ""
                        ? "bg-cricket-gold text-slate-950"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    All Cricketers
                  </button>
                  {CRICKET_PLAYERS.map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => setSelectedPlayer(p.slug)}
                      className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                        selectedPlayer === p.slug
                          ? "bg-cricket-gold text-slate-950 font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="text-[10px] opacity-75">{p.country}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Product Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                <div className="text-5xl mb-3">🏏</div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  No cricket products matched your filters
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                  Try clearing some filter criteria like specific Willow Grades or Player endorsements to see more match equipment.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-xl cricket-gradient text-white text-xs font-bold shadow-md hover:brightness-110 transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const isAdded = addedItemSlug === product.slug;
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-cricket-pitch/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                    >
                      <div>
                        {/* Header Badges */}
                        <div className="p-4 pb-0 flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {product.brand.name}
                          </span>
                          {product.hasKnockingOption && (
                            <span className="flex items-center gap-1 text-[10px] font-extrabold text-cricket-gold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Shield className="w-3 h-3 text-cricket-gold" />
                              Knock-in Ready
                            </span>
                          )}
                        </div>

                        {/* Visual / Image */}
                        <Link
                          href={`/products/${product.slug}`}
                          className="block p-6 text-center group-hover:scale-105 transition-transform duration-300"
                        >
                          <div className="w-full h-44 rounded-xl bg-slate-50 flex items-center justify-center text-5xl mb-2">
                            {product.category.slug === "cricket-bats"
                              ? "🏏"
                              : product.category.slug === "cricket-balls"
                              ? "🔴"
                              : "🛡️"}
                          </div>
                        </Link>

                        {/* Info */}
                        <div className="px-5 pb-2">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-slate-800">
                              {product.rating}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({product.reviewCount})
                            </span>
                          </div>

                          <Link
                            href={`/products/${product.slug}`}
                            className="block text-sm font-bold text-slate-900 group-hover:text-cricket-pitch transition-colors line-clamp-2"
                          >
                            {product.name}
                          </Link>

                          {product.batSpecs && (
                            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                                {product.batSpecs.grainCount} Grains
                              </span>
                              <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                {product.batSpecs.edgeThickness} Edge
                              </span>
                              <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
                                {product.batSpecs.sweetSpot} Sweet Spot
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Price & Action */}
                      <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                        <div>
                          <div className="text-base font-black text-slate-900">
                            ৳{(product.discountPrice || product.basePrice).toLocaleString()}
                          </div>
                          {product.discountPrice && (
                            <div className="text-xs line-through text-slate-400">
                              ৳{product.basePrice.toLocaleString()}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleQuickAdd(product)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : "cricket-gradient text-white hover:brightness-110 shadow-sm"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-bold">Loading Cricket Catalog...</div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
