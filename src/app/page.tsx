import HeroSlider from "@/components/home/HeroSlider";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ShopByPlayer from "@/components/home/ShopByPlayer";
import KnockingServiceBanner from "@/components/home/KnockingServiceBanner";
import { CRICKET_BRANDS } from "@/lib/data/cricket-products";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Star, Award } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-0">
      {/* Hero Banner Section */}
      <HeroSlider />

      {/* Categories Grid */}
      <CategoryGrid />

      {/* Featured Gear Section */}
      <FeaturedProducts />

      {/* Shop By Player Section */}
      <ShopByPlayer />

      {/* Knocking Service Lab Showcase */}
      <KnockingServiceBanner />

      {/* Shop by Brand Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-cricket-pitch">
              AUTHORIZED GLOBAL DISTRIBUTOR
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Shop by International Cricket Brand
            </h2>
          </div>
          <Link
            href="/brands"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cricket-pitch hover:underline mt-2 md:mt-0"
          >
            <span>View All Partner Brands</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {CRICKET_BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/products?brand=${brand.slug}`}
              className="group bg-white rounded-2xl p-4 border border-slate-200 hover:border-cricket-pitch/40 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center h-32"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-cricket-pitch/10 flex items-center justify-center text-xl font-black text-slate-800 group-hover:text-cricket-pitch transition-colors mb-2">
                🏏
              </div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-cricket-pitch line-clamp-1">
                {brand.name}
              </div>
              <div className="text-[10px] text-slate-400">
                {brand.country}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Customer Reviews & Social Proof */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400" />
              ))}
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              Trusted by Premier League & Club Cricketers
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Over 15,000 bats knocked and delivered across Dhaka Premier League (DPL), first-class divisions, and youth cricket academies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "The SS Master 9000 with the pro knocking service was completely game-ready. Ping off the middle is explosive and balance in hand is feather light.",
                author: "Tanvir Ahmed",
                role: "First Division League Batsman, Dhaka",
                verified: true,
              },
              {
                quote: "Ordered Kookaburra match balls and pads for our academy in Sylhet. Delivered via courier in 24 hours in pristine tamper-evident packing.",
                author: "Coach Mahmudur Rahman",
                role: "Sylhet Youth Cricket Academy",
                verified: true,
              },
              {
                quote: "Finding genuine Grade 1 English Willow in Bangladesh was always risky until Cricket Store Pro. Authentic barcode verification and amazing customer care.",
                author: "Rashedul Karim",
                role: "Club Cricketer, Chattogram",
                verified: true,
              },
            ].map((review, idx) => (
              <div
                key={idx}
                className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
              >
                <p className="text-xs text-slate-300 leading-relaxed italic mb-6">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <div className="w-9 h-9 rounded-full bg-cricket-pitch flex items-center justify-center font-bold text-white text-xs">
                    {review.author[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{review.author}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-cricket-lime" />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {review.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
