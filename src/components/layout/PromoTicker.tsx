import React, { useState, useEffect } from 'react';
import { PROMO_ANNOUNCEMENTS } from '../../data/cricketData';
import { Truck, Clock, Zap, Award, ChevronLeft, ChevronRight } from 'lucide-react';

export const PromoTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMO_ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PROMO_ANNOUNCEMENTS.length) % PROMO_ANNOUNCEMENTS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PROMO_ANNOUNCEMENTS.length);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'truck': return <Truck size={14} className="text-[#ccff00]" />;
      case 'clock': return <Clock size={14} className="text-[#ccff00]" />;
      case 'zap': return <Zap size={14} className="text-[#ccff00]" />;
      default: return <Award size={14} className="text-[#ccff00]" />;
    }
  };

  const current = PROMO_ANNOUNCEMENTS[currentIndex];

  return (
    <div className="bg-neutral-900 text-white text-xs font-semibold py-2 px-4 border-b border-neutral-800 relative select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="text-neutral-400 hover:text-white transition-colors p-1"
          aria-label="Previous announcement"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center justify-center space-x-2 text-center transition-all duration-300">
          {getIcon(current.icon)}
          <span className="tracking-wider uppercase text-[11px] sm:text-xs">
            {current.text}
          </span>
          <span className="bg-[#ccff00] text-black text-[9px] font-black px-1.5 py-0.5 rounded ml-2 hidden sm:inline-block">
            USE CODE: CRICKET10 FOR 10% OFF
          </span>
        </div>

        <button
          onClick={handleNext}
          className="text-neutral-400 hover:text-white transition-colors p-1"
          aria-label="Next announcement"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
