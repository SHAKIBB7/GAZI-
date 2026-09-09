import Link from "next/link";
import { CRICKET_PLAYERS } from "@/lib/data/cricket-products";
import { Zap, ArrowRight } from "lucide-react";

export default function ShopByPlayer() {
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-cricket-gold">
            <Zap className="w-3.5 h-3.5 fill-cricket-gold" />
            <span>PLAYER EDITION SIGNATURE ARSENAL</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Shop by International Cricketer
          </h2>
        </div>
        <Link
          href="/players"
          className="inline-flex items-center gap-1 text-xs font-bold text-cricket-pitch hover:underline mt-2 md:mt-0"
        >
          <span>View All Endorsed Profiles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CRICKET_PLAYERS.map((player) => (
          <div
            key={player.slug}
            className="group relative bg-slate-950 text-white rounded-3xl p-6 overflow-hidden border border-slate-800 shadow-xl flex flex-col justify-between"
          >
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cricket-pitch/40 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <div>
              {/* Player Country Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  {player.country}
                </span>
                <span className="text-xs font-bold text-cricket-lime">
                  {player.endorsedBrand}
                </span>
              </div>

              {/* Player Avatar placeholder / Icon */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-slate-700 flex items-center justify-center text-4xl mb-4 shadow-lg group-hover:border-cricket-lime transition-colors">
                👤
              </div>

              <h3 className="text-xl font-black tracking-tight text-white group-hover:text-cricket-lime transition-colors">
                {player.name}
              </h3>
              <p className="text-xs text-slate-400 font-semibold mb-3">
                {player.role}
              </p>

              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-xs">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Bat of Choice:
                </div>
                <div className="text-white font-bold mt-0.5 line-clamp-1">
                  {player.weapon}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                href={`/products?player=${player.slug}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 group-hover:cricket-gradient text-white text-xs font-bold transition-all border border-slate-700 group-hover:border-transparent"
              >
                <span>Explore {player.name.split(" ")[0]}&apos;s Gear</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
