import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, Menu, ChevronDown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onSelectCategory: (category: string) => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onSelectCategory,
  onOpenMobileMenu,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlistItems, setIsWishlistOpen } = useWishlist();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    {
      title: 'BATS',
      category: 'Bats',
      subLinks: [
        'All Cricket Bats',
        'Adult English Willow',
        'Junior & Kids Bats',
        'Gunn & Moore Bats',
        'adidas Bats',
        'DSC Bats',
        'Ben Stokes Collection',
      ],
    },
    {
      title: 'SHOES',
      category: 'Shoes',
      subLinks: [
        'All Cricket Footwear',
        'Full Metal Spikes',
        'Bowling Spikes',
        'Turf & Indoor Trainers',
        'adidas Footwear',
        'New Balance Footwear',
        'Puma Footwear',
        'Payntr Footwear',
      ],
    },
    {
      title: 'BATTING EQUIPMENT',
      category: 'Batting Equipment',
      subLinks: [
        'All Batting Protection',
        'Batting Pads / Leg Guards',
        'Batting Gloves',
        'Thigh & Chest Guards',
        'Kookaburra Equipment',
        'Chase Equipment',
      ],
    },
    {
      title: 'PROTECTION',
      category: 'Protection',
      subLinks: [
        'All Helmets',
        'KNYX Helmets',
        'Masuri Helmets',
        'StemGuard Neck Protectors',
        'Arm Guards & Abdo Guards',
      ],
    },
    {
      title: 'CLOTHING',
      category: 'Clothing',
      subLinks: [
        'All Cricket Clothing',
        'Replica Kits & Jerseys',
        'Castore T20 Kits',
        'Matchday Whites',
        'Training Apparel',
      ],
    },
    {
      title: 'LUGGAGE',
      category: 'Luggage',
      subLinks: [
        'All Cricket Bags',
        'Wheelie Bags',
        'Duffle Bags',
        'Bat Sleeves & Covers',
      ],
    },
    {
      title: 'SALE',
      category: 'Sale',
      isSale: true,
      subLinks: [
        'All Sale Items',
        'Bats on Sale',
        'Shoes Clearance',
        'Up to 40% Off Selected Lines',
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Mobile Hamburger & Logo */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden text-white p-1.5 hover:bg-neutral-800 rounded transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Menu size={24} />
          </button>

          <a href="#" className="flex items-center space-x-2 group">
            {/* Gazi Sports Brand Mark */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-lg sm:text-2xl tracking-tighter uppercase font-mono leading-none">
                  GAZI<span className="text-[#ccff00]">.</span>SPORTS
                </span>
                <span className="bg-[#ccff00] text-black text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                  CRICKET BD
                </span>
              </div>
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest -mt-0.5 font-sans hidden sm:block">
                Bangladesh's Cricket Specialist
              </span>
            </div>
          </a>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center space-x-1 xl:space-x-3">
          {navItems.map((item) => (
            <div
              key={item.title}
              className="relative group"
              onMouseEnter={() => setActiveDropdown(item.title)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => onSelectCategory(item.category)}
                className={`flex items-center space-x-1 px-2.5 py-2 text-xs font-bold tracking-wider transition-colors uppercase cursor-pointer rounded ${
                  item.isSale
                    ? 'text-red-400 hover:text-red-300 font-extrabold'
                    : 'text-neutral-200 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <span>{item.title}</span>
                <ChevronDown size={12} className="opacity-60 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {/* Mega Dropdown */}
              {activeDropdown === item.title && (
                <div className="absolute top-full left-0 w-64 bg-neutral-950 border border-neutral-800 shadow-2xl py-3 px-2 rounded-b-md z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 px-3 pb-2 border-b border-neutral-800 mb-2">
                    {item.title} Collections
                  </div>
                  {item.subLinks.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        onSelectCategory(item.category);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:text-[#ccff00] hover:bg-neutral-900 rounded transition-colors flex items-center justify-between"
                    >
                      <span>{sub}</span>
                      <span className="text-neutral-500 text-[10px]">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right: Actions (Search, Wishlist, Bag) */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-3 py-2 rounded-full border border-neutral-700 transition-colors text-xs cursor-pointer"
            aria-label="Search equipment"
          >
            <Search size={16} className="text-[#ccff00]" />
            <span className="hidden sm:inline font-medium text-neutral-300 text-xs">
              Search bats, shoes, gear...
            </span>
            <kbd className="hidden md:inline-block bg-neutral-800 text-neutral-400 text-[9px] px-1.5 py-0.5 rounded border border-neutral-700">
              /
            </kbd>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2.5 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-full transition-colors cursor-pointer"
            aria-label="View Wishlist"
          >
            <Heart size={20} />
            {totalWishlistItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ccff00] text-black font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {totalWishlistItems}
              </span>
            )}
          </button>

          {/* Cart Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center space-x-2 bg-white text-black hover:bg-neutral-200 px-3.5 py-2 rounded-full font-bold transition-transform active:scale-95 cursor-pointer"
            aria-label="View Shopping Bag"
          >
            <ShoppingBag size={18} />
            <span className="text-xs font-black hidden sm:inline">BAG</span>
            <span className="bg-black text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
