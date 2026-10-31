import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { CurrencyCode } from '../../types/cricket';
import {
  Globe,
  HelpCircle,
  Package,
  Heart,
  PhoneCall,
  MessageCircle,
  X,
  Search,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { apiService } from '../../services/api';

interface UtilityBarProps {
  onOpenAdmin?: () => void;
}

export const UtilityBar: React.FC<UtilityBarProps> = ({ onOpenAdmin }) => {
  const { currency, setCurrency } = useCart();
  const { totalWishlistItems, setIsWishlistOpen } = useWishlist();

  // Support & Tracking Dialog States
  const [activeModal, setActiveModal] = useState<'track' | 'help' | null>(null);
  const [trackQuery, setTrackQuery] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Close modals on Escape key
  useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as CurrencyCode);
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = trackQuery.trim();
    if (!clean) {
      setTrackError('Please enter your tracking reference (e.g. GZ-TRK-XXXXXX)');
      return;
    }
    setTrackLoading(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const order = await apiService.trackOrder(clean);
      if (order) {
        setTrackResult(order);
      } else {
        setTrackError(`No order found matching "${clean}". Please verify your reference or contact our hotline.`);
      }
    } catch {
      setTrackError('Could not retrieve tracking details. Please call our hotline: 01837805877.');
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <>
      <div className="bg-[#121212] text-neutral-300 text-xs py-1.5 border-b border-neutral-800 overflow-x-clip">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between">
          {/* Left: Express delivery badge */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="text-[11px] font-medium tracking-wide hidden sm:inline">
              Narsingdi & Dhaka Express: 24h | Nationwide: 48-72h | Cash on Delivery
            </span>
            <span className="text-[11px] font-medium tracking-wide sm:hidden truncate max-w-[130px]">
              Express Delivery BD
            </span>
          </div>

          {/* Right: Actions & Tools */}
          <div className="flex items-center space-x-2.5 sm:space-x-5 text-[11px] shrink-0">
            {/* Hotline / MFS (Desktop) */}
            <div className="hidden lg:flex items-center space-x-1 text-neutral-300">
              <PhoneCall size={12} className="text-[#ccff00]" />
              <span className="font-semibold text-[11px]">Hotline: 01837805877</span>
            </div>

            {/* WhatsApp Direct Chat (hidden on small mobile to prevent overflow; floating button is always visible) */}
            <a
              href="https://wa.me/8801647294474?text=Hello%20Gazi%20Sports%2099"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              <MessageCircle size={12} className="text-emerald-400" />
              <span>WhatsApp: 01647294474</span>
            </a>

            {/* Wishlist Link (Desktop) */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="hidden md:flex items-center space-x-1 hover:text-white transition-colors cursor-pointer"
            >
              <Heart size={13} className="text-[#ccff00]" />
              <span>Wishlist ({totalWishlistItems})</span>
            </button>

            {/* Track Order Trigger */}
            <button
              onClick={() => {
                setActiveModal('track');
                setTrackResult(null);
                setTrackError(null);
              }}
              className="hidden sm:flex items-center space-x-1 hover:text-white transition-colors cursor-pointer"
            >
              <Package size={13} />
              <span>Track Order</span>
            </button>

            {/* Help & FAQ Trigger */}
            <button
              onClick={() => setActiveModal('help')}
              className="hidden sm:flex items-center space-x-1 hover:text-white transition-colors cursor-pointer"
            >
              <HelpCircle size={13} />
              <span>Help & FAQ</span>
            </button>

            {/* Currency selector */}
            <div className="flex items-center space-x-1 border border-neutral-700 rounded px-1.5 py-0.5 bg-neutral-900">
              <Globe size={11} className="text-neutral-400 shrink-0" />
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
          </div>
        </div>
      </div>

      {/* Modern Order Tracking Modal */}
      {activeModal === 'track' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-lg bg-neutral-950 text-white rounded-2xl border border-neutral-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
              <div className="flex items-center space-x-2">
                <Package size={20} className="text-[#ccff00]" />
                <h3 className="font-mono font-black text-sm uppercase tracking-wider">
                  Live Order Tracking (অর্ডার ট্র্যাকিং)
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-900 transition-colors"
                aria-label="Close tracking modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleTrackSubmit} className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-neutral-300">
                Enter Tracking Number or Order ID:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="e.g. GZ-TRK-XXXXXX or GZ-BD-..."
                  className="flex-1 bg-neutral-900 border border-neutral-700 text-white px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-[#ccff00]"
                />
                <button
                  type="submit"
                  disabled={trackLoading}
                  className="bg-[#ccff00] hover:bg-[#b5e600] text-black font-black text-xs px-4 py-2 rounded-xl transition-all uppercase flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Search size={14} />
                  <span>{trackLoading ? 'Searching...' : 'Track'}</span>
                </button>
              </div>
            </form>

            {trackError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs mb-4">
                {trackError}
              </div>
            )}

            {trackResult && (
              <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 space-y-3 text-xs mb-4">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                  <span className="text-neutral-400 font-medium">Tracking Number:</span>
                  <span className="font-mono font-black text-[#ccff00]">{trackResult.trackingNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-medium">Fulfillment Status:</span>
                  <span className="font-bold text-white uppercase bg-neutral-800 px-2 py-0.5 rounded text-[11px]">
                    {trackResult.fulfillmentStatus || trackResult.status || 'Processing'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-medium">Assigned Courier:</span>
                  <span className="font-semibold text-neutral-200">{trackResult.courier || 'Steadfast Courier'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-medium">Estimated Delivery:</span>
                  <span className="font-semibold text-neutral-200">{trackResult.estimatedDelivery || '24–48 Hours'}</span>
                </div>
                {trackResult.financials && (
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                    <span className="text-neutral-400 font-medium">Order Total:</span>
                    <span className="font-mono font-black text-white">
                      ৳{Number(trackResult.financials.total).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <p>For instantaneous dispatch updates, you can also contact us:</p>
              <div className="flex flex-wrap gap-3 pt-1 font-semibold text-neutral-300">
                <a href="tel:01837805877" className="text-[#ccff00] hover:underline flex items-center space-x-1">
                  <PhoneCall size={11} />
                  <span>01837805877</span>
                </a>
                <a
                  href="https://wa.me/8801647294474"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <MessageCircle size={11} />
                  <span>WhatsApp: 01647294474</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Help & FAQ Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-lg bg-neutral-950 text-white rounded-2xl border border-neutral-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
              <div className="flex items-center space-x-2">
                <HelpCircle size={20} className="text-[#ccff00]" />
                <h3 className="font-mono font-black text-sm uppercase tracking-wider">
                  Support & Store Info (গ্রাহক সেবা)
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-900 transition-colors"
                aria-label="Close help modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Store Details */}
              <div className="bg-neutral-900 rounded-xl p-3.5 border border-neutral-800 space-y-2">
                <div className="flex items-start space-x-2.5">
                  <MapPin size={15} className="text-[#ccff00] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Physical Store Hub</h4>
                    <p className="text-neutral-400 text-[11px]">
                      Gazi Sports 99, Narsingdi Stadium Complex, Narsingdi, Bangladesh
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 pt-1 border-t border-neutral-800/80">
                  <Clock size={14} className="text-[#ccff00] shrink-0" />
                  <span className="text-neutral-300 text-[11px]">
                    Open Daily: 9:00 AM – 10:00 PM (সপ্তাহের ৭ দিন খোলা)
                  </span>
                </div>
              </div>

              {/* Direct Contacts */}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href="tel:01837805877"
                  className="bg-neutral-900 hover:bg-neutral-800 p-3 rounded-xl border border-neutral-800 transition-colors flex flex-col items-center text-center space-y-1"
                >
                  <PhoneCall size={18} className="text-[#ccff00]" />
                  <span className="font-bold text-white text-xs">Hotline / MFS</span>
                  <span className="text-[11px] font-mono text-neutral-300">01837805877</span>
                </a>

                <a
                  href="https://wa.me/8801647294474?text=Hello%20Gazi%20Sports%2099"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-neutral-900 hover:bg-neutral-800 p-3 rounded-xl border border-neutral-800 transition-colors flex flex-col items-center text-center space-y-1"
                >
                  <MessageCircle size={18} className="text-emerald-400" />
                  <span className="font-bold text-white text-xs">WhatsApp Direct</span>
                  <span className="text-[11px] font-mono text-neutral-300">01647294474</span>
                </a>
              </div>

              {/* Delivery Guarantees */}
              <div className="space-y-2 pt-1 text-neutral-300 text-[11px]">
                <div className="flex items-center space-x-2">
                  <Truck size={14} className="text-[#ccff00] shrink-0" />
                  <span>
                    <strong>Nationwide Delivery:</strong> 24h within Dhaka/Narsingdi, 48–72h across Bangladesh.
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck size={14} className="text-[#ccff00] shrink-0" />
                  <span>
                    <strong>100% Genuine Gear:</strong> Official English Willow bats, authentic spikes & equipment.
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-[#ccff00] shrink-0" />
                  <span>
                    <strong>Cash on Delivery:</strong> Inspect your parcel upon arrival before completing payment.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
