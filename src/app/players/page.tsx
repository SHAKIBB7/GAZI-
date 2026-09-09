import Link from "next/link";
import { Zap, ArrowRight, Award, ShieldCheck } from "lucide-react";
import { CRICKET_PLAYERS } from "@/lib/data/cricket-products";

export default function PlayersPage() {
  return (
    <div className="bg-slate-50 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-cricket-gold bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-3">
            <Zap className="w-3.5 h-3.5 fill-cricket-gold" />
            <span>CRICKET STORE PRO SIGNATURE COLLECTION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Shop by International Cricketer
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
            Discover the exact weapon profiles, willow grades, sweet spot positions, and weight preferences trusted by the world&apos;s greatest batsmen.
          </p>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CRICKET_PLAYERS.map((player) => (
            <div
              key={player.slug}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl cricket-gradient text-white flex items-center justify-center text-3xl shadow-md">
                      👤
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900 group-hover:text-cricket-pitch transition-colors">
                          {player.name}
                        </h2>
                        <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {player.country}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {player.role}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-cricket-gold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    {player.endorsedBrand}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Signature Bat Specification:
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {player.weapon}
                  </div>
                  <div className="text-slate-500 leading-relaxed">
                    Customized with laser-etched player insignia, duckbill balance profile, and hand-selected English Willow cleft.
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Authorized Match Edition</span>
                </div>

                <Link
                  href={`/products?player=${player.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl cricket-gradient text-white text-xs font-bold shadow-md hover:brightness-110 transition-all"
                >
                  <span>Explore Player Gear</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
