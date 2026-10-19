import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CricketEssentialsProps {
  onSelectCategory: (category: string) => void;
}

export const CricketEssentials: React.FC<CricketEssentialsProps> = ({ onSelectCategory }) => {
  const essentials = [
    {
      title: 'CRICKET BATS',
      subtitle: 'Senior & Junior Willow',
      image: 'https://www.prodirectsport.com/cdn/shop/files/Content_Tab_Portrait_Cricket_Bats_060726.jpg?v=1783337397&width=800',
      category: 'Bats',
    },
    {
      title: 'BATTING PADS',
      subtitle: 'Traditional Cane & Foam',
      image: 'https://www.prodirectsport.com/cdn/shop/files/Content_Tab_Portrait_Batting_Pads_060726.jpg?v=1783337403&width=800',
      category: 'Batting Equipment',
    },
    {
      title: 'BATTING GLOVES',
      subtitle: 'Split-Finger & Shark Tooth',
      image: 'https://www.prodirectsport.com/cdn/shop/files/Content_Tab_Portrait_Batting_Gloves_060726.jpg?v=1783337410&width=800',
      category: 'Batting Equipment',
    },
    {
      title: 'HELMETS',
      subtitle: 'BS7928:2013 Certified Defense',
      image: 'https://www.prodirectsport.com/cdn/shop/files/Content_Tab_Portrait_helmets_2_060726.jpg?v=1783337504&width=800',
      category: 'Protection',
    },
  ];

  const shoeTiles = [
    {
      title: 'SPIKES & TURF FOOTWEAR',
      subtitle: 'Bowling & Batting Cricket Shoes',
      image: 'https://www.prodirectsport.com/cdn/shop/files/Content_Tab_Square_Cricket_Mixed_shoes_060726.jpg?v=1783337515&width=800',
      category: 'Shoes',
    },
    {
      title: 'WICKET KEEPING GLOVES',
      subtitle: 'Octopus Grip & Padded Cuffs',
      image: 'https://www.prodirectsport.com/cdn/shop/files/Content_Tab_Rectangle_Wicket_Keeping_Gloves_060726.jpg?v=1783337528&width=800',
      category: 'Batting Equipment',
    },
  ];

  return (
    <section className="py-14 px-4 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto">
        {/* Section 1: Cricket Essentials */}
        <div className="mb-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-neutral-500">
                GAZI SPORTS CURATED
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 font-mono mt-0.5">
                CRICKET ESSENTIALS
              </h2>
            </div>
            <button
              onClick={() => onSelectCategory('All')}
              className="hidden sm:flex items-center space-x-1 text-xs font-black uppercase text-neutral-900 hover:text-[#7ab800] transition-colors cursor-pointer"
            >
              <span>View All Essentials</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {essentials.map((item) => (
              <div
                key={item.title}
                onClick={() => onSelectCategory(item.category)}
                className="group relative rounded-xl overflow-hidden aspect-[600/865] bg-neutral-100 border border-neutral-200 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-4"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity group-hover:from-black/95" />

                <div className="relative z-10 text-white">
                  <span className="text-[10px] text-[#ccff00] font-black uppercase tracking-wider block mb-0.5">
                    {item.subtitle}
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-tight font-mono leading-tight">
                    {item.title}
                  </h3>
                  <div className="mt-2 text-[11px] font-bold text-neutral-300 flex items-center space-x-1 group-hover:text-white transition-colors">
                    <span>Shop Now</span>
                    <span className="text-[#ccff00]">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Footwear & Specialty Featured Split */}
        <div>
          <div className="mb-6">
            <span className="text-xs font-black uppercase tracking-widest text-neutral-500">
              PERFORMANCE FOCUS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 font-mono mt-0.5">
              SPECIALTY CRICKET CATEGORIES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shoeTiles.map((tile) => (
              <div
                key={tile.title}
                onClick={() => onSelectCategory(tile.category)}
                className="group relative rounded-xl overflow-hidden h-56 sm:h-72 bg-neutral-900 border border-neutral-800 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6"
              >
                <img
                  src={tile.image}
                  alt={tile.title}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="relative z-10 text-white">
                  <span className="bg-[#ccff00] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-2">
                    POPULAR CATEGORY
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-mono text-white">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1 mb-3">
                    {tile.subtitle}
                  </p>
                  <span className="inline-flex items-center space-x-1.5 bg-white text-black font-extrabold text-xs px-4 py-2 rounded-full uppercase tracking-wider group-hover:bg-[#ccff00] transition-colors">
                    <span>Explore Range</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
