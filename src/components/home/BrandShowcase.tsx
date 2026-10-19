import React from 'react';
import { BRANDS } from '../../data/cricketData';

interface BrandShowcaseProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}

export const BrandShowcase: React.FC<BrandShowcaseProps> = ({
  selectedBrand,
  onSelectBrand,
}) => {
  return (
    <section className="bg-neutral-100 py-6 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">
            OFFICIAL BRAND PARTNERS
          </span>
          {selectedBrand !== 'All' && (
            <button
              onClick={() => onSelectBrand('All')}
              className="text-xs text-neutral-600 hover:text-black font-semibold underline cursor-pointer"
            >
              Reset brand filter
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onSelectBrand('All')}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              selectedBrand === 'All'
                ? 'bg-black text-[#ccff00] shadow'
                : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
            }`}
          >
            All Brands
          </button>

          {BRANDS.map((brand) => (
            <button
              key={brand.name}
              onClick={() => onSelectBrand(brand.name)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedBrand === brand.name
                  ? 'bg-black text-[#ccff00] shadow'
                  : 'bg-white text-neutral-800 hover:bg-neutral-200 border border-neutral-300'
              }`}
            >
              <span>{brand.name}</span>
              <span className="ml-1.5 text-[10px] text-neutral-400 font-normal">
                ({brand.count})
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
