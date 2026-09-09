import Link from "next/link";
import { ShieldCheck, Truck, RefreshCw, Award, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 pt-16 pb-8">
      {/* Top Value Propositions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cricket-pitch/20 border border-cricket-pitch/40 flex items-center justify-center text-cricket-lime flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                100% Genuine English Willow
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Directly sourced from master bat makers in England, Australia, and India with verifiable authenticity stamps.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cricket-gold/20 border border-cricket-gold/40 flex items-center justify-center text-cricket-gold flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                Pro Bat Knocking Lab
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                15,000 automated machine strikes, double linseed oiling, bone pressing, and protective anti-scuff sheet application.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                Express Delivery 64 Districts
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Same-day delivery in Dhaka Metro, 24-48 hours nationwide via Steadfast, Pathao Courier, and RedX.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                7 Days Easy Return & Exchange
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hassle-free size exchange for batting pads, gloves, shoes, and helmets with our replacement guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl cricket-gradient flex items-center justify-center text-white font-black text-lg">
                🏏
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                CRICKET<span className="text-cricket-lime">STORE</span> PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Bangladesh&apos;s premier multi-vendor cricket equipment platform. Catering to grassroots talent, premier league stars, and international champions with elite equipment and factory custom orders.
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cricket-lime" />
                <span>Cricket Studio & Bat Fitting Lab, Mirpur-2, Dhaka-1216</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cricket-lime" />
                <span>Hotline: +880 1700-CRICKET (+880 1700 274253)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cricket-lime" />
                <span>support@cricketstorepro.com</span>
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Cricket Gear
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?category=cricket-bats" className="hover:text-white transition-colors">English Willow Bats</Link></li>
              <li><Link href="/products?category=cricket-bats" className="hover:text-white transition-colors">Kashmir Willow Bats</Link></li>
              <li><Link href="/products?category=cricket-balls" className="hover:text-white transition-colors">Match Leather Balls</Link></li>
              <li><Link href="/products?category=batting-equipment" className="hover:text-white transition-colors">Batting Pads & Gloves</Link></li>
              <li><Link href="/products?category=wicket-keeping" className="hover:text-white transition-colors">Wicket Keeping Gear</Link></li>
              <li><Link href="/products?category=cricket-shoes" className="hover:text-white transition-colors">Spike & Turf Shoes</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Customer Hub
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link href="/order-tracking" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/knocking-service" className="hover:text-white transition-colors">Knocking & Bat Care Guide</Link></li>
              <li><Link href="/size-guide" className="hover:text-white transition-colors">Bat & Pad Sizing Chart</Link></li>
              <li><Link href="/warranty-policy" className="hover:text-white transition-colors">Willow Warranty Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Privacy & Terms</Link></li>
            </ul>
          </div>

          {/* Multi-Vendor & Partners */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Partner & Business
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/seller" className="hover:text-white transition-colors text-cricket-gold font-bold">Seller Registration (Merchant Portal)</Link></li>
              <li><Link href="/bulk-orders" className="hover:text-white transition-colors">Cricket Academy Wholesale</Link></li>
              <li><Link href="/jersey-customization" className="hover:text-white transition-colors">Custom Team Jersey Orders</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
              <li><Link href="/affiliate" className="hover:text-white transition-colors">Coaches & Affiliate Program</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Badges & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Cricket Store Pro. All Rights Reserved. Built for champions.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-400">Accepted Gateways:</span>
            <span className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-pink-400 font-bold text-[10px]">bKash PGW</span>
            <span className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-orange-400 font-bold text-[10px]">Nagad</span>
            <span className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-purple-400 font-bold text-[10px]">Rocket</span>
            <span className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-blue-400 font-bold text-[10px]">SSLCommerz (Cards)</span>
            <span className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-emerald-400 font-bold text-[10px]">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
