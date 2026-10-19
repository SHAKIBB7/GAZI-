import React from 'react';
import { DEPARTMENTS } from '../../data/cricketData';
import { DepartmentCard } from '../../types/cricket';
import { ArrowUpRight } from 'lucide-react';

interface DepartmentGridProps {
  onSelectCategory: (category: string) => void;
}

export const DepartmentGrid: React.FC<DepartmentGridProps> = ({ onSelectCategory }) => {
  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-neutral-500 text-xs font-bold uppercase tracking-widest">
              EXPLORE CRICKET GEAR
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 font-mono mt-1">
              SHOP BY DEPARTMENT
            </h2>
          </div>
          <p className="text-neutral-500 text-xs sm:text-sm mt-1 sm:mt-0">
            Hand-selected equipment for every discipline at the crease
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {DEPARTMENTS.map((dept: DepartmentCard) => (
            <div
              key={dept.id}
              onClick={() => onSelectCategory(dept.categoryFilter)}
              className="group relative rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 aspect-[3/4] flex flex-col justify-end p-4 cursor-pointer hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <img
                src={dept.image}
                alt={dept.name}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity group-hover:from-black/95" />

              {/* Text */}
              <div className="relative z-10 text-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#ccff00] font-black uppercase tracking-wider">
                    {dept.itemCount} Items
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#ccff00] group-hover:text-black transition-colors">
                    <ArrowUpRight size={13} />
                  </div>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base leading-tight uppercase font-mono">
                  {dept.name}
                </h3>
                <p className="text-[10px] text-neutral-300 line-clamp-1">
                  {dept.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
