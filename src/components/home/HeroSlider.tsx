"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Award } from "lucide-react";

export default function HeroSlider() {
  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-cricket-pitch-dark to-slate-950 text-white overflow-hidden py-16 sm:py-24 border-b border-cricket-pitch-light/20">
      {/* Decorative Turf Texture Elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#84CC16_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cricket-lime/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cricket-pitch/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-cricket-pitch/60 border border-cricket-lime/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-cricket-lime uppercase tracking-widest backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 fill-cricket-lime" />
              <span>2026 International Collection</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              POWER YOUR INNINGS WITH{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cricket-lime to-amber-300">
                GENUINE ENGLISH WILLOW
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience the pinnacle of boundary-clearing performance. Handcrafted Grade 1+ clefts, precision balance, 40mm power edges, and certified factory knock-in service ready for match day.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/products?category=cricket-bats"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full cricket-gradient text-white font-bold text-sm shadow-lg shadow-cricket-pitch/50 hover:brightness-110 transition-all transform hover:-translate-y-0.5"
              >
                <span>Shop Master Bats</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/players"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-slate-900/80 border border-slate-700 hover:border-cricket-lime text-slate-200 hover:text-white font-bold text-sm backdrop-blur-sm transition-all"
              >
                <span>Shop by Cricketer</span>
              </Link>
            </div>

            {/* Quick Trust Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-cricket-lime">100%</div>
                <div className="text-xs text-slate-400 font-medium">Original Willow Clefts</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-cricket-gold">15,000+</div>
                <div className="text-xs text-slate-400 font-medium">Machine Knocking Strikes</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">64 Dist.</div>
                <div className="text-xs text-slate-400 font-medium">Express Courier Shipping</div>
              </div>
            </div>
          </div>

          {/* Right Featured Bat Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 p-6 border border-slate-800 shadow-2xl">
              {/* Top Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-cricket-leather text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  HOTTEST SELLER
                </span>
                <span className="text-xs text-cricket-lime font-bold">Grade 1+ Willow</span>
              </div>

              {/* Bat Icon Representation / Visual */}
              <div className="h-64 rounded-2xl bg-gradient-to-tr from-cricket-pitch-dark to-slate-900 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
                <div className="text-7xl mb-2 animate-bounce duration-1000">🏏</div>
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400">
                  KOOKABURRA KAHUNA PRO
                </div>
                <div className="text-xs text-cricket-gold font-bold">11 Straight Grains • 2lb 11.5oz</div>

                {/* Floating Specs Overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="text-slate-400">Edges</div>
                    <div className="font-bold text-white">40mm Massive</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Sweet Spot</div>
                    <div className="font-bold text-cricket-lime">Mid Profile</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Balance</div>
                    <div className="font-bold text-white">Feather Pickup</div>
                  </div>
                </div>
              </div>

              {/* Pricing & Knocking inclusion */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 line-through">৳42,000</div>
                  <div className="text-2xl font-black text-white">৳38,500</div>
                </div>
                <Link
                  href="/products/kookaburra-kahuna-pro-english-willow-2026"
                  className="px-4 py-2 rounded-xl cricket-gradient text-white text-xs font-bold hover:brightness-110 transition-all"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
