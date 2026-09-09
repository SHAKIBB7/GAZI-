import Link from "next/link";
import { ShieldCheck, Flame, CheckCircle, Wrench } from "lucide-react";

export default function KnockingServiceBanner() {
  const steps = [
    {
      step: "01",
      title: "Raw Linseed Oiling",
      desc: "Slow hand massage with genuine English linseed oil to seal moisture and enhance willow elasticity.",
    },
    {
      step: "02",
      title: "15,000 Machine Strikes",
      desc: "Precision pneumatic hammer strikes across the sweet spot, edges, and toe with progressive force.",
    },
    {
      step: "03",
      title: "Bone Mallet Profiling",
      desc: "Hardwood bone roller passes over the vulnerable 40mm edges to round and harden the fibers against snicks.",
    },
    {
      step: "04",
      title: "Extratec Shield Application",
      desc: "Crystal-clear high-density protective anti-scuff film with fiber-reinforced edge tape.",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-cricket-pitch-dark via-cricket-pitch to-slate-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-cricket-lime/20 border border-cricket-lime/40 px-3 py-1 rounded-full text-xs font-bold text-cricket-lime uppercase tracking-widest mb-3">
            <Wrench className="w-3.5 h-3.5" />
            <span>Cricket Store Pro Knocking & Bat Fitting Lab</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Never Walk Out to Bat With an Unprepared Willow
          </h2>
          <p className="text-slate-300 text-sm mt-3 leading-relaxed">
            Raw English willow fibers need progressive compaction to withstand 140 km/h leather ball impact. Our certified laboratory knocks and seals your bat so it is match-ready from ball one.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-cricket-lime/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl font-black text-cricket-lime mb-2">
                  {s.step}
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {s.desc}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-1.5 text-xs text-cricket-lime font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Lab Certified</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Callout */}
        <div className="mt-12 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cricket-gold/20 flex items-center justify-center text-cricket-gold text-xl font-black">
              🏏
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Buying a New Bat Today?
              </div>
              <div className="text-xs text-slate-400">
                Tick the &ldquo;Add Knocking & Oiling Service&rdquo; (+৳1,500) on any English/Kashmir willow bat.
              </div>
            </div>
          </div>
          <Link
            href="/products?category=cricket-bats"
            className="px-6 py-2.5 rounded-full bg-cricket-lime text-slate-950 text-xs font-extrabold hover:bg-lime-400 transition-colors whitespace-nowrap"
          >
            Browse Bats with Knocking Option
          </Link>
        </div>
      </div>
    </section>
  );
}
