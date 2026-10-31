import React from 'react';
import { useCart } from '../../context/CartContext';
import { CurrencyCode } from '../../types/cricket';
import { Globe, HelpCircle, Package, Heart, PhoneCall, ShieldCheck, MessageCircle } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

interface UtilityBarProps {
  onOpenAdmin?: () => void;
}

export const UtilityBar: React.FC<UtilityBarProps> = ({ onOpenAdmin }) => {
  const { currency, setCurrency } = useCart();
  const { totalWishlistItems, setIsWishlistOpen } = useWishlist();

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as CurrencyCode);
  };

  return (
    <div className="bg-[#121212] text-neutral-300 text-xs py-1.5 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1.5 text-neutral-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="text-[11px] font-medium tracking-wide hidden sm:inline">
              Narsingdi & Dhaka Express: 24h | Nationwide: 48-72h | Cash on Delivery Available
            </span>
            <span className="text-[11px] font-medium tracking-wide sm:hidden truncate max-w-[140px]">
              Express Delivery BD
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-5 text-[11px]">
          {/* Hotline / MFS */}
          <div className="hidden lg:flex items-center space-x-1 text-neutral-300">
            <PhoneCall size={12} className="text-[#ccff00]" />
            <span className="font-semibold text-[11px]">Phone/MFS: 01837805877</span>
          </div>

          {/* WhatsApp Direct Chat */}
          <a
            href="https://wa.me/8801647294474?text=Hello%20Gazi%20Sports%2099"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            <MessageCircle size={12} className="text-emerald-400" />
            <span>WhatsApp: 01647294474</span>
          </a>

          {/* Wishlist Link on Desktop */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="hidden md:flex items-center space-x-1 hover:text-white transition-colors cursor-pointer"
          >
            <Heart size={13} className="text-[#ccff00]" />
            <span>Wishlist ({totalWishlistItems})</span>
          </button>

          {/* Track order */}
          <a
            href="#tracking"
            onClick={(e) => {
              e.preventDefault();
              alert(
                'Gazi Sports 99 Order Tracking: Enter your GZ-TRK-XXXXXX reference number sent via SMS upon order confirmation. For live updates call 01837805877 or WhatsApp 01647294474.'
              );
            }}
            className="hidden sm:flex items-center space-x-1 hover:text-white transition-colors"
          >
            <Package size={13} />
            <span>Track Order</span>
          </a>

          {/* Help */}
          <a
            href="#help"
            onClick={(e) => {
              e.preventDefault();
              alert(
                'Gazi Sports 99 Support: Narsingdi Stadium, Narsingdi. Hours: 9am-10pm Daily. Hotline / bKash / Nagad / Rocket: 01837805877 | WhatsApp: 01647294474'
              );
            }}
            className="hidden sm:flex items-center space-x-1 hover:text-white transition-colors"
          >
            <HelpCircle size={13} />
            <span>Help & FAQ</span>
          </a>

          {/* Currency dropdown */}
          <div className="flex items-center space-x-1 border border-neutral-700 rounded px-1.5 py-0.5 bg-neutral-900">
            <Globe size={12} className="text-neutral-400" />
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="bg-transparent text-white text-[11px] font-semibold focus:outline-none cursor-pointer"
              aria-label="Select Currency"
            >
              <option value="BDT" className="bg-neutral-900 text-white">BDT (৳)</option>
              <option value="USD" className="bg-neutral-900 text-white">USD ($)</option>
              <option value="GBP" className="bg-neutral-900 text-white">GBP (£)</option>
            </select>
          </div>

          {/* Admin Portal Gateway */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-neutral-900 border border-[#ccff00]/40 text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-bold transition-all cursor-pointer"
            >
              <ShieldCheck size={12} />
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
