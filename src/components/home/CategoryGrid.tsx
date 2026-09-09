import Link from "next/link";
import { CRICKET_CATEGORIES } from "@/lib/data/cricket-products";
import { ArrowRight } from "lucide-react";

export default function CategoryGrid() {
  const categoryIcons: Record<string, string> = {
    "cricket-bats": "🏏",
    "cricket-balls": "🔴",
    "batting-equipment": "🛡️",
    "wicket-keeping": "🧤",
    "cricket-shoes": "👟",
    clothing: "👕",
    accessories: "🎒",
    "training-equipment": "🎯",
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <span className="text-xs font-black tracking-widest uppercase text-cricket-pitch">
            EXPLORE THE PRO GEAR RANGE
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Shop by Cricket Category
          </h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-cricket-pitch hover:text-cricket-pitch-light transition-colors mt-2 md:mt-0"
        >
          <span>View All 300+ Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {CRICKET_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-cricket-pitch/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Background subtle glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-cricket-pitch/5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {categoryIcons[cat.slug] || "🏏"}
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-cricket-pitch transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {cat.count} Available Products
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cricket-pitch">
              <span>Explore Range</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
