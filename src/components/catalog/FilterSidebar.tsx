import React from 'react';
import { BRANDS } from '../../data/cricketData';
import { useCart } from '../../context/CartContext';
import { Filter, RotateCcw, Check } from 'lucide-react';

interface FilterSidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  onlySale: boolean;
  onToggleSale: (val: boolean) => void;
  onResetFilters: () => void;
  totalFiltered: number;
}

const CATEGORIES = [
  'All',
  'Cricket Bats',
  'Cricket Footwear',
  'Batting Equipment',
  'Cricket Helmets',
  'Cricket Clothing',
  'Cricket Bags',
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  maxPrice,
  onMaxPriceChange,
  onlySale,
  onToggleSale,
  onResetFilters,
  totalFiltered,
}) => {
  const { formatPrice } = useCart();

  return (
    <aside className="w-full lg:w-64 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <div className="flex items-center space-x-2 text-neutral-900 font-black text-sm uppercase tracking-wider">
          <Filter size={16} />
          <span>Filters ({totalFiltered})</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-[11px] font-bold text-neutral-500 hover:text-black flex items-center space-x-1 cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 mb-2.5">
          Department
        </h4>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-black text-[#ccff00] font-bold'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span>{cat === 'All' ? 'All Departments' : cat}</span>
              {selectedCategory === cat && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="border-t border-neutral-200 pt-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 mb-2.5">
          Brand
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectBrand('All')}
            className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
              selectedBrand === 'All'
                ? 'bg-black text-[#ccff00] font-bold'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <span>All Brands</span>
            {selectedBrand === 'All' && <Check size={14} />}
          </button>
          {BRANDS.map((b) => (
            <button
              key={b.name}
              onClick={() => onSelectBrand(b.name)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                selectedBrand === b.name
                  ? 'bg-black text-[#ccff00] font-bold'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span>{b.name}</span>
              <span className="text-[10px] text-neutral-400">({b.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-neutral-200 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
            Max Price (মূল্য সীমা)
          </h4>
          <span className="text-xs font-bold text-neutral-900">
            Up to {formatPrice(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="5000"
          max="100000"
          step="1000"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          className="w-full accent-black cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
          <span>{formatPrice(5000)}</span>
          <span>{formatPrice(100000)}</span>
        </div>
      </div>

      {/* Sale Toggle */}
      <div className="border-t border-neutral-200 pt-4">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            Sale Items Only
          </span>
          <input
            type="checkbox"
            checked={onlySale}
            onChange={(e) => onToggleSale(e.target.checked)}
            className="w-4 h-4 accent-red-600 rounded cursor-pointer"
          />
        </label>
      </div>
    </aside>
  );
};
