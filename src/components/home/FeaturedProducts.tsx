"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ShoppingCart, Check, Shield } from "lucide-react";
import { CRICKET_PRODUCTS, CricketProduct } from "@/lib/data/cricket-products";
import { useCartStore } from "@/lib/store/cart-store";

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<"all" | "bats" | "balls" | "protective">("all");
  const [addedItemSlug, setAddedItemSlug] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  const filteredProducts = CRICKET_PRODUCTS.filter((prod) => {
    if (activeTab === "bats") return prod.category.slug === "cricket-bats";
    if (activeTab === "balls") return prod.category.slug === "cricket-balls";
    if (activeTab === "protective") return prod.category.slug === "batting-equipment";
    return true;
  });

  const handleQuickAdd = (product: CricketProduct) => {
    addItem(product, "Short Handle (SH)", "2lb 10oz", false);
    setAddedItemSlug(product.slug);
    setTimeout(() => setAddedItemSlug(null), 2000);
  };

  return (
    <section className="py-16 bg-slate-100/70 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-cricket-pitch">
              VERIFIED AUTHENTICITY
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Trending Pro Match Gear
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: "all", label: "All Gear" },
              { id: "bats", label: "English Willow Bats" },
              { id: "balls", label: "Match Balls" },
              { id: "protective", label: "Protection" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "cricket-gradient text-white shadow-md shadow-cricket-pitch/30"
                    : "bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 8).map((product) => {
            const isAdded = addedItemSlug === product.slug;
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-cricket-pitch/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Card Header Badges */}
                  <div className="p-4 pb-0 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {product.brand.name}
                    </span>
                    {product.hasKnockingOption ? (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold text-cricket-gold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Shield className="w-3 h-3 text-cricket-gold" />
                        Knock-in Ready
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">
                        {product.brand.country}
                      </span>
                    )}
                  </div>

                  {/* Visual / Image Area */}
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

                  {/* Product Details */}
                  <div className="px-5 pb-2">
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                      </div>
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

                    {/* Bat Specifics Pill */}
                    {product.batSpecs && (
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                          {product.batSpecs.grainCount} Grains
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {product.batSpecs.edgeThickness} Edge
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Price & Add to Cart */}
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
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
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
      </div>
    </section>
  );
}
