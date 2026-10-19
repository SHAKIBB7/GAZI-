import React, { useState } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  Award,
  Mail,
  ArrowRight,
  Share2,
  Globe,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  MapPin,
  PhoneCall,
} from 'lucide-react';
import { BRANDS } from '../../data/cricketData';
import { apiService } from '../../services/api';

export const Footer: React.FC<{ onSelectBrand?: (brand: string) => void }> = ({ onSelectBrand }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      await apiService.subscribeNewsletter(email.trim());
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-black text-neutral-300 border-t border-neutral-800">
      {/* 4 Trust Pillars */}
      <div className="border-b border-neutral-800 py-8 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-800">
              <Truck size={22} className="text-[#ccff00]" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Fast Nationwide Delivery</h4>
              <p className="text-neutral-400 text-xs">Dhaka ৳70 | Outside ৳130 (Free over ৳5,000)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-800">
              <RotateCcw size={22} className="text-[#ccff00]" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Hassle-Free Replacement</h4>
              <p className="text-neutral-400 text-xs">7-day sizing exchange across Bangladesh</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-800">
              <ShieldCheck size={22} className="text-[#ccff00]" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">100% Genuine Gear</h4>
              <p className="text-neutral-400 text-xs">Direct from certified global cricket makers</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-800">
              <Award size={22} className="text-[#ccff00]" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Expert Equipment Advice</h4>
              <p className="text-neutral-400 text-xs">Willow knock-in & sizing at Mirpur Hub</p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup & Flagship Hub / Hotline Tiles */}
      <div className="py-12 bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Newsletter Subscription */}
          <div className="lg:col-span-8 text-center lg:text-left">
            <span className="text-[#ccff00] text-xs font-black tracking-widest uppercase">
              GAZI CRICKET CLUB BANGLADESH
            </span>
            <h3 className="text-white text-2xl sm:text-3xl font-extrabold uppercase tracking-tight mt-1 mb-2 font-mono">
              GET 10% OFF YOUR FIRST ORDER
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mb-6">
              Join thousands of cricketers across Bangladesh. Receive priority updates on limited edition English Willow drops, special Tigers deals, and club discounts.
            </p>

            {subscribed ? (
              <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 p-4 rounded-lg inline-block text-sm font-semibold animate-in fade-in duration-300">
                ✓ Welcome to the Club! Use voucher code <span className="font-mono font-bold text-white bg-emerald-800 px-2 py-0.5 rounded">CRICKET10</span> at checkout for 10% off.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto lg:mx-0">
                <div className="relative w-full">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="w-full bg-black border border-neutral-700 text-white pl-10 pr-4 py-3 rounded-full text-xs focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold text-xs px-6 py-3 rounded-full uppercase tracking-wider shrink-0 transition-transform active:scale-95 flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Physical Hub & Hotline */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            {/* Hub Tile */}
            <div className="flex items-center space-x-3.5 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
              <div className="w-11 h-11 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-800 text-[#ccff00]">
                <MapPin size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                  Mirpur Stadium Hub
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Gate #2, National Cricket Stadium, Mirpur-2, Dhaka
                </p>
              </div>
            </div>

            {/* Hotline Tile */}
            <div className="flex items-center space-x-3.5 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
              <div className="w-11 h-11 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-800 text-[#ccff00]">
                <PhoneCall size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                  Helpline: +880 1700-000000
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Daily 9:00 AM - 10:00 PM (Dhaka Time)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
        {/* Col 1 */}
        <div>
          <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
            HELP & INFO
          </h4>
          <ul className="space-y-2.5 text-neutral-400">
            <li><a href="#" className="hover:text-white transition-colors">Bangladesh Delivery & Shipping</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Track Your Order (GZ-TRK)</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cash on Delivery (COD) Guide</a></li>
            <li><a href="#" className="hover:text-white transition-colors">7-Day Replacement Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Bat Knocking-In Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Customer Service & Hotline</a></li>
          </ul>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
            CRICKET BRANDS
          </h4>
          <ul className="space-y-2.5 text-neutral-400">
            {BRANDS.slice(0, 6).map((b) => (
              <li key={b.name}>
                <button
                  type="button"
                  onClick={() => onSelectBrand?.(b.name)}
                  className="hover:text-[#ccff00] transition-colors cursor-pointer text-left"
                >
                  {b.name} Cricket ({b.count})
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
            DEPARTMENTS
          </h4>
          <ul className="space-y-2.5 text-neutral-400">
            <li><a href="#catalog" className="hover:text-white transition-colors">Adult English Willow Bats</a></li>
            <li><a href="#catalog" className="hover:text-white transition-colors">Junior Cricket Bats</a></li>
            <li><a href="#catalog" className="hover:text-white transition-colors">Cricket Spikes & Turf Trainers</a></li>
            <li><a href="#catalog" className="hover:text-white transition-colors">Batting Pads & Gloves</a></li>
            <li><a href="#catalog" className="hover:text-white transition-colors">Helmets & Head Protection</a></li>
            <li><a href="#catalog" className="hover:text-white transition-colors">Cricket Clothing & Replica</a></li>
            <li><a href="#catalog" className="hover:text-white transition-colors">Cricket Wheelie & Duffle Bags</a></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
            ABOUT GAZI CRICKET
          </h4>
          <p className="text-neutral-400 text-xs leading-relaxed mb-4">
            Gazi Cricket is Bangladesh's premier specialist cricket equipment destination. Delivering authentic player-grade English Willow, protective equipment, and official team gear across all 64 districts.
          </p>
          <div className="flex items-center space-x-3 text-neutral-400">
            <a href="#" className="p-2 rounded-full bg-neutral-900 hover:text-white hover:bg-neutral-800 transition-colors" title="Socials">
              <Share2 size={16} />
            </a>
            <a href="#" className="p-2 rounded-full bg-neutral-900 hover:text-white hover:bg-neutral-800 transition-colors" title="Online Store">
              <Globe size={16} />
            </a>
            <a href="#" className="p-2 rounded-full bg-neutral-900 hover:text-white hover:bg-neutral-800 transition-colors" title="Chat Support">
              <MessageSquare size={16} />
            </a>
            <a href="#" className="p-2 rounded-full bg-neutral-900 hover:text-white hover:bg-neutral-800 transition-colors" title="Community">
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* SEO & Brand Description Accordion */}
      <div className="border-t border-neutral-900 py-6 bg-neutral-950/80 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsTextExpanded(!isTextExpanded)}>
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">
              Gazi Cricket Bangladesh — The Cricketer's Choice
            </h4>
            <button className="text-neutral-400 hover:text-white flex items-center space-x-1 text-[11px]">
              <span>{isTextExpanded ? 'Read Less' : 'Read More'}</span>
              <ChevronDown size={14} className={`transform transition-transform ${isTextExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isTextExpanded && (
            <div className="mt-3 text-[11px] text-neutral-500 leading-relaxed space-y-2 border-t border-neutral-900 pt-3 animate-in fade-in duration-200">
              <p>
                Shop cricket equipment at Gazi Cricket Bangladesh, including English Willow cricket bats, bowling spikes, rubber studs, batting pads, batting gloves, certified helmets, cricket balls, team replica shirts, and kit bags. Featuring international brands like Gunn & Moore, Gray-Nicolls, Kookaburra, adidas, New Balance, DSC, Masuri, and KNYX.
              </p>
              <p>
                Nationwide express delivery to Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh, and all surrounding upazilas via Steadfast Courier and Pathao Logistics. Safe and convenient Cash on Delivery (COD), bKash, Nagad, and Card payments supported.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Legal & Payment Badges */}
      <div className="border-t border-neutral-900 py-6 bg-neutral-950 text-neutral-500 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-white">GAZI CRICKET BANGLADESH</span>
            <span>• Dhaka Stadium Hub</span>
            <span>• All rights reserved © 2026</span>
          </div>

          {/* Payment and Courier icons */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-neutral-400">
            <span className="bg-emerald-950 text-emerald-400 px-2 py-1 rounded border border-emerald-800">CASH ON DELIVERY</span>
            <span className="bg-[#e2136e]/20 text-[#e2136e] px-2 py-1 rounded border border-[#e2136e]/40">bKash</span>
            <span className="bg-[#f7941d]/20 text-[#f7941d] px-2 py-1 rounded border border-[#f7941d]/40">Nagad</span>
            <span className="bg-neutral-900 px-2 py-1 rounded border border-neutral-800">VISA</span>
            <span className="bg-neutral-900 px-2 py-1 rounded border border-neutral-800">MASTERCARD</span>
            <span className="bg-neutral-900 px-2 py-1 rounded border border-neutral-800">DBBL NEXUS</span>
            <span className="bg-neutral-900 text-neutral-300 px-2 py-1 rounded border border-neutral-800">STEADFAST / PATHAO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
