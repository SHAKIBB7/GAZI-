import React from 'react';

interface TopSportsBarProps {
  onSelectCategory?: (category: string) => void;
}

const CRICKET_SECTIONS = [
  { name: 'CRICKET BATS', category: 'Bats' },
  { name: 'CRICKET FOOTWEAR', category: 'Shoes' },
  { name: 'BATTING GEAR', category: 'Batting Equipment' },
  { name: 'HELMETS & PROTECTION', category: 'Protection' },
  { name: 'JERSEYS & CLOTHING', category: 'Clothing' },
  { name: 'BAGS & LUGGAGE', category: 'Luggage' },
];

export const TopSportsBar: React.FC<TopSportsBarProps> = ({ onSelectCategory }) => {
  const handleClick = (category: string) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    } else {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-black text-neutral-400 text-[11px] font-semibold tracking-wider border-b border-neutral-800 hidden sm:block">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
          {CRICKET_SECTIONS.map((sec, idx) => (
            <button
              key={sec.name}
              type="button"
              onClick={() => handleClick(sec.category)}
              className={`px-3 py-1.5 transition-colors cursor-pointer uppercase ${
                idx === 0
                  ? 'text-white bg-neutral-900 border-b-2 border-[#ccff00] font-bold'
                  : 'hover:text-white'
              }`}
            >
              {sec.name}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-neutral-400 uppercase tracking-widest hidden lg:flex items-center space-x-3">
          <span className="text-[#ccff00] font-bold">★ GAZI CRICKET BANGLADESH</span>
          <span>•</span>
          <span>100% GENUINE GEAR</span>
          <span>•</span>
          <span className="text-emerald-400">CASH ON DELIVERY</span>
        </div>
      </div>
    </div>
  );
};
