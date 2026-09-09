"use client";

import { Flame, ShieldCheck, Truck } from "lucide-react";

export default function TopBanner() {
  return (
    <div className="bg-cricket-pitch-dark text-white text-xs sm:text-sm py-2 px-4 border-b border-cricket-pitch-light/30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-cricket-lime animate-pulse" />
          <Flame className="w-4 h-4 text-cricket-gold" />
          <span>
            <strong>BPL & World Cup Offer:</strong> Use Code <span className="bg-cricket-gold text-slate-950 font-bold px-1.5 py-0.5 rounded text-xs">CRICKET10</span> for 10% OFF!
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-slate-300 text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cricket-lime" />
            <span>100% Original Willow Guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-cricket-lime" />
            <span>Express Delivery All Over Bangladesh</span>
          </div>
          <div className="text-cricket-gold font-semibold">
            <span>Call: +880 1700-CRICKET</span>
          </div>
        </div>
      </div>
    </div>
  );
}
