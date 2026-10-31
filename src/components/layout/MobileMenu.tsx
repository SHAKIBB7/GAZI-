import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronDown, Heart, ShoppingBag, ShieldCheck, PhoneCall, MapPin, MessageCircle, Package, HelpCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  onOpenAdmin?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenAdmin,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlistItems, setIsWishlistOpen } = useWishlist();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections = [
    {
      title: 'CRICKET BATS',
      category: 'Bats',
      items: ['All Bats', 'English Willow Adults', 'Junior Bats', 'Ben Stokes GM Diamond', 'adidas Incurza', 'DSC Pearla']
    },
    {
      title: 'CRICKET SHOES',
      category: 'Shoes',
      items: ['All Footwear', 'Full Metal Spikes', 'Bowling Shoes', 'Turf Trainers', 'adidas 22YDS', 'New Balance CK4030', 'Puma evoSPEED']
    },
    {
      title: 'BATTING EQUIPMENT',
      category: 'Batting Equipment',
      items: ['Batting Pads', 'Batting Gloves', 'Thigh Protection', 'Inner Thigh Guards']
    },
    {
      title: 'HELMETS & PROTECTION',
      category: 'Protection',
      items: ['KNYX Helmets', 'Masuri Helmets', 'StemGuards', 'Chest & Arm Guards']
    },
    {
      title: 'CRICKET CLOTHING & REPLICA',
      category: 'Clothing',
      items: ['Castore Replica Kits', 'T20 Shirts', 'Training Poly Polos', 'Match Whites']
    },
    {
      title: 'BAGS & LUGGAGE',
      category: 'Luggage',
      items: ['Wheelie Bags', 'Duffle Bags', 'Bat Sleeves']
    },
    {
      title: 'OUTLET / SALE',
      category: 'Sale',
      isSale: true,
      items: ['All Discounted Cricket Equipment', 'Clearance Footwear', 'Selected Bats Up to 40% Off']
    }
  ];

  const toggleSection = (title: string) => {
    setExpandedSection(prev => prev === title ? null : title);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-neutral-950 text-white h-full shadow-2xl flex flex-col z-10 border-r border-neutral-800">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-black">
          <div className="flex items-center space-x-2.5">
            <img
              src="/logo-crest.png"
              alt="Gazi Sports 99"
              className="h-8 w-auto object-contain drop-shadow-[0_2px_6px_rgba(255,140,0,0.35)]"
            />
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tighter uppercase font-mono">
                GAZI<span className="text-[#ccff00]">.</span>SPORTS
              </span>
              <span className="bg-[#ccff00] text-black text-xs font-black px-1.5 py-0.5 rounded uppercase font-mono">
                99
              </span>
              <span className="bg-neutral-800 text-neutral-300 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                BD
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick actions strip */}
        <div className="grid grid-cols-2 border-b border-neutral-800 bg-neutral-900 text-xs">
          <button
            onClick={() => {
              onClose();
              setIsWishlistOpen(true);
            }}
            className="flex items-center justify-center space-x-2 py-3 border-r border-neutral-800 hover:bg-neutral-800 text-neutral-300 font-semibold cursor-pointer"
          >
            <Heart size={16} className="text-[#ccff00]" />
            <span>Wishlist ({totalWishlistItems})</span>
          </button>
          <button
            onClick={() => {
              onClose();
              setIsCartOpen(true);
            }}
            className="flex items-center justify-center space-x-2 py-3 hover:bg-neutral-800 text-neutral-300 font-semibold cursor-pointer"
          >
            <ShoppingBag size={16} className="text-[#ccff00]" />
            <span>Bag ({totalItems})</span>
          </button>
        </div>

        {/* Mobile Dedicated Order Tracking & Help Bar */}
        <div className="p-2.5 border-b border-neutral-800 bg-neutral-950 grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('open-track-order'));
            }}
            className="flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[#ccff00] font-bold transition-colors cursor-pointer text-[11px]"
          >
            <Package size={14} />
            <span>Track Order (অর্ডার ট্র্যাক)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('open-help-modal'));
            }}
            className="flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold transition-colors cursor-pointer text-[11px]"
          >
            <HelpCircle size={14} />
            <span>Help & FAQ (সহায়তা)</span>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-900">
          {sections.map((sec) => (
            <div key={sec.title}>
              <button
                onClick={() => toggleSection(sec.title)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-xs tracking-wider transition-colors hover:bg-neutral-900"
              >
                <span className={sec.isSale ? 'text-red-400 font-black' : 'text-neutral-100'}>
                  {sec.title}
                </span>
                {expandedSection === sec.title ? (
                  <ChevronDown size={16} className="text-neutral-400" />
                ) : (
                  <ChevronRight size={16} className="text-neutral-500" />
                )}
              </button>

              {expandedSection === sec.title && (
                <div className="bg-neutral-900/60 px-4 py-2 space-y-1">
                  <button
                    onClick={() => {
                      onSelectCategory(sec.category);
                      onClose();
                    }}
                    className="w-full text-left py-1.5 text-xs text-[#ccff00] font-bold"
                  >
                    View All {sec.title} →
                  </button>
                  {sec.items.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        onSelectCategory(sec.category);
                        onClose();
                      }}
                      className="w-full text-left py-1.5 text-xs text-neutral-300 hover:text-white"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Admin Portal Direct Mobile Access */}
        {onOpenAdmin && (
          <div className="p-3 border-t border-neutral-800 bg-neutral-950">
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-[#ccff00]/40 text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck size={16} />
                <span>Admin Portal (ম্যানেজমেন্ট প্যানেল)</span>
              </div>
              <ChevronRight size={14} className="text-neutral-400" />
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/60 text-xs text-neutral-400 space-y-2.5">
          <div className="flex items-start space-x-2 text-neutral-300 text-[11px]">
            <MapPin size={14} className="text-[#ccff00] shrink-0 mt-0.5" />
            <span>Narsingdi Stadium, Narsingdi</span>
          </div>
          <div className="flex items-center space-x-2 text-neutral-300 text-[11px]">
            <PhoneCall size={14} className="text-[#ccff00] shrink-0" />
            <span>bKash/Nagad/Rocket: <strong className="text-white font-mono">01837805877</strong></span>
          </div>
          <a
            href="https://wa.me/8801647294474?text=Hello%20Gazi%20Sports%2099"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors"
          >
            <MessageCircle size={15} />
            <span>WhatsApp: 01647294474</span>
          </a>
        </div>
      </div>
    </div>
  );
};
