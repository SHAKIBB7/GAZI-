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
  X,
  Package,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { BRANDS } from '../../data/cricketData';
import { apiService } from '../../services/api';

export const Footer: React.FC<{ onSelectBrand?: (brand: string) => void; onOpenAdmin?: () => void }> = ({ onSelectBrand, onOpenAdmin }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [activePolicy, setActivePolicy] = useState<'shipping' | 'cod' | 'replacement' | 'knocking' | null>(null);

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
              <p className="text-neutral-400 text-xs">Willow knock-in & sizing at Narsingdi Hub</p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup & Flagship Hub / Hotline Tiles */}
      <div className="py-12 bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Newsletter Subscription */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <span className="text-[#ccff00] text-xs font-black tracking-widest uppercase">
              GAZI SPORTS 99 BANGLADESH
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

          {/* Right Column: Physical Hub, Hotline & WhatsApp */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            {/* Hub Tile */}
            <div className="flex items-center space-x-3.5 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-800 text-[#ccff00]">
                <MapPin size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                  Narsingdi Stadium Hub
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Narsingdi Stadium, Narsingdi, Bangladesh
                </p>
              </div>
            </div>

            {/* Phone & MFS (bKash/Nagad/Rocket) Tile */}
            <div className="flex items-center space-x-3.5 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-800 text-[#ccff00]">
                <PhoneCall size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                  bKash / Nagad / Rocket: 01837805877
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Hotline & Orders • Daily 9:00 AM - 10:00 PM
                </p>
              </div>
            </div>

            {/* WhatsApp Chat Tile */}
            <a
              href="https://wa.me/8801647294474?text=Hello%20Gazi%20Sports%2099"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3.5 bg-emerald-950/40 hover:bg-emerald-950/80 p-3 rounded-xl border border-emerald-800/60 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-900/60 flex items-center justify-center shrink-0 border border-emerald-700 text-emerald-400">
                <MessageSquare size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <span>WhatsApp: 01647294474</span>
                  <ExternalLink size={12} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-[11px] text-emerald-400">
                  Click to Chat Directly on WhatsApp
                </p>
              </div>
            </a>
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
            <li>
              <button
                type="button"
                onClick={() => setActivePolicy('shipping')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Bangladesh Delivery & Shipping
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-track-order'))}
                className="hover:text-[#ccff00] text-neutral-300 font-semibold transition-colors cursor-pointer text-left flex items-center space-x-1"
              >
                <span>Track Your Order (GZ-TRK)</span>
                <span className="text-[10px] text-[#ccff00]">→</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActivePolicy('cod')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Cash on Delivery (COD) Guide
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActivePolicy('replacement')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                7-Day Replacement Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActivePolicy('knocking')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Bat Knocking-In Service
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-help-modal'))}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Customer Service & Hotline
              </button>
            </li>
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
          <div className="flex items-center space-x-2.5 mb-4 border-b border-neutral-800 pb-2">
            <img
              src="/logo-crest.png"
              alt="Gazi Sports 99"
              className="h-8 w-auto object-contain drop-shadow-[0_2px_6px_rgba(255,140,0,0.3)]"
            />
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              ABOUT GAZI SPORTS 99
            </h4>
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed mb-4">
            Gazi Sports 99 is Bangladesh's premier specialist cricket equipment destination, located at Narsingdi Stadium, Narsingdi. Delivering authentic player-grade English Willow, protective equipment, and official team gear across all 64 districts.
          </p>
          <div className="flex items-center space-x-3 text-neutral-400">
            <a href="https://wa.me/8801647294474?text=Hello%20Gazi%20Sports%2099" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 hover:text-white hover:bg-emerald-800 transition-colors" title="WhatsApp Support">
              <MessageSquare size={16} />
            </a>
            <a href="#" className="p-2 rounded-full bg-neutral-900 hover:text-white hover:bg-neutral-800 transition-colors" title="Socials">
              <Share2 size={16} />
            </a>
            <a href="#" className="p-2 rounded-full bg-neutral-900 hover:text-white hover:bg-neutral-800 transition-colors" title="Online Store">
              <Globe size={16} />
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
              Gazi Sports 99 Bangladesh — The Cricketer's Choice
            </h4>
            <button className="text-neutral-400 hover:text-white flex items-center space-x-1 text-[11px]">
              <span>{isTextExpanded ? 'Read Less' : 'Read More'}</span>
              <ChevronDown size={14} className={`transform transition-transform ${isTextExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isTextExpanded && (
            <div className="mt-3 text-[11px] text-neutral-500 leading-relaxed space-y-2 border-t border-neutral-900 pt-3 animate-in fade-in duration-200">
              <p>
                Shop cricket equipment at Gazi Sports 99 Bangladesh, including English Willow cricket bats, bowling spikes, rubber studs, batting pads, batting gloves, certified helmets, cricket balls, team replica shirts, and kit bags. Featuring international brands like Gunn & Moore, Gray-Nicolls, Kookaburra, adidas, New Balance, DSC, Masuri, and KNYX.
              </p>
              <p>
                Nationwide express delivery to Dhaka, Narsingdi, Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh, and all surrounding upazilas via Steadfast Courier and Pathao Logistics. Safe and convenient Cash on Delivery (COD), bKash, Nagad, Rocket, and Card payments supported.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Legal & Payment Badges */}
      <div className="border-t border-neutral-900 py-6 bg-neutral-950 text-neutral-500 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <img
              src="/logo-crest.png"
              alt="Gazi Sports 99"
              className="h-6 w-auto object-contain"
            />
            <span className="font-mono font-bold text-white">GAZI SPORTS 99 BANGLADESH</span>
            <span>• Narsingdi Stadium Hub</span>
            <span>• All rights reserved © 2026</span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hover:text-[#ccff00] text-[#ccff00]/70 text-[10px] uppercase font-bold transition-colors cursor-pointer pl-2 border-l border-neutral-800"
              >
                Admin Portal
              </button>
            )}
          </div>

          {/* Payment and Courier icons */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-neutral-400">
            <span className="bg-emerald-950 text-emerald-400 px-2 py-1 rounded border border-emerald-800">CASH ON DELIVERY</span>
            <span className="bg-[#e2136e]/20 text-[#e2136e] px-2 py-1 rounded border border-[#e2136e]/40">bKash</span>
            <span className="bg-[#f7941d]/20 text-[#f7941d] px-2 py-1 rounded border border-[#f7941d]/40">Nagad</span>
            <span className="bg-[#8c3494]/20 text-[#d782df] px-2 py-1 rounded border border-[#8c3494]/40">Rocket</span>
            <span className="bg-neutral-900 px-2 py-1 rounded border border-neutral-800">VISA</span>
            <span className="bg-neutral-900 px-2 py-1 rounded border border-neutral-800">MASTERCARD</span>
            <span className="bg-neutral-900 px-2 py-1 rounded border border-neutral-800">DBBL NEXUS</span>
            <span className="bg-neutral-900 text-neutral-300 px-2 py-1 rounded border border-neutral-800">STEADFAST / PATHAO</span>
          </div>
        </div>
      </div>

      {/* Interactive Policy Modal */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActivePolicy(null)} />
          <div className="relative w-full max-w-lg bg-neutral-950 text-white rounded-2xl border border-neutral-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="font-mono font-black text-sm uppercase tracking-wider text-[#ccff00]">
                {activePolicy === 'shipping' && 'ডেলিভারি ও শিপিং পলিসি (Delivery & Shipping)'}
                {activePolicy === 'cod' && 'ক্যাশ অন ডেলিভারি নির্দেশিকা (COD Guide)'}
                {activePolicy === 'replacement' && '৭-দিনের রিপ্লেসমেন্ট গ্যারান্টি (7-Day Replacement)'}
                {activePolicy === 'knocking' && 'ব্যাট নকিং ও প্রিপারেশন সার্ভিস (Bat Knocking-In)'}
              </h3>
              <button
                onClick={() => setActivePolicy(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-900 transition-colors"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs text-neutral-300 space-y-3 leading-relaxed">
              {activePolicy === 'shipping' && (
                <>
                  <p>
                    গাজী স্পোর্টস ৯৯ সারা বাংলাদেশে বিশ্বস্ত কুরিয়ার সার্ভিস (Steadfast ও Pathao Logistics)-এর মাধ্যমে দ্রুততম ডেলিভারি নিশ্চিত করে।
                  </p>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1.5 font-medium">
                    <p className="text-white font-bold">ডেলিভারি চার্জ ও সময়সূচী:</p>
                    <p>• <strong>ঢাকা ও নরসিংদী জেলা:</strong> ৳৭০ (২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি)</p>
                    <p>• <strong>ঢাকার বাইরে (সকল জেলা ও উপজেলা):</strong> ৳১৩০ (২ থেকে ৪ কর্মদিবস)</p>
                    <p className="text-[#ccff00]">★ ৳৫,০০০ বা তার বেশি অর্ডারে সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি!</p>
                  </div>
                </>
              )}

              {activePolicy === 'cod' && (
                <>
                  <p>
                    বাংলাদেশের ৬৪টি জেলাতেই ১০০% ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা রয়েছে।
                  </p>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1.5">
                    <p>• ডেলিভারিম্যানের সামনে পার্সেল যাচাই করার পূর্ণ অধিকার আপনার রয়েছে।</p>
                    <p>• সাধারণ ক্রিকেট অর্ডারের ক্ষেত্রে কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।</p>
                    <p>• পার্সেল পাওয়ার পর নগদ বা bKash/Nagad দিয়ে পেমেন্ট সম্পন্ন করতে পারবেন।</p>
                  </div>
                </>
              )}

              {activePolicy === 'replacement' && (
                <>
                  <p>
                    আমরা চাই প্রতিটি ক্রিকেটার তার উপযুক্ত সাইজের গিয়ার নিয়ে মাঠে নামুক। তাই আমরা দিচ্ছি ৭ দিনের সহজ রিপ্লেসমেন্ট সুবিধা।
                  </p>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1.5">
                    <p>• ব্যাটিং প্যাড, গ্লাভস, জুতো বা হেলমেটের সাইজ ম্যাচ না করলে ৭ দিনের মধ্যে এক্সচেঞ্জ করা যাবে।</p>
                    <p>• প্রডাক্টটি অবশ্যই অক্ষত, অব্যবহৃত এবং মূল ট্যাগসহ থাকতে হবে।</p>
                    <p>• রিপ্লেসমেন্টের জন্য আমাদের হটলাইন (01837805877) বা WhatsApp-এ যোগাযোগ করলেই আমরা নতুন সাইজ পাঠিয়ে দেব।</p>
                  </div>
                </>
              )}

              {activePolicy === 'knocking' && (
                <>
                  <p>
                    নরসিংদী স্টেডিয়াম হাবের অভিজ্ঞ ক্রিকেট টেকনিশিয়ানদের দ্বারা প্লেয়ার-গ্রেড ইংলিশ উইলো ব্যাট প্রফেশনাল হ্যান্ড-নকিং ও রেডি করার ব্যবস্থা রয়েছে।
                  </p>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1.5">
                    <p>• ১৫,০০০+ কাঠের ম্যালট স্ট্রাইক দিয়ে ব্যাটের এজ ও সুইটস্পট কম্প্রেস করা হয়।</p>
                    <p>• কাঁচা চামড়ার বল ও ফাস্ট বোলিংয়ের বিরুদ্ধে উইলো ফাটল রোধে স্পেশাল বোনিং প্রসেস।</p>
                    <p>• এক্সট্রাটেক অ্যান্টি-স্কাফ প্রোটেকশন শিট ও রাবার টো-গার্ড ফিটিং সম্পন্ন করা হয়।</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setActivePolicy(null)}
                className="bg-[#ccff00] hover:bg-[#b5e600] text-black font-extrabold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer"
              >
                ঠিক আছে (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
