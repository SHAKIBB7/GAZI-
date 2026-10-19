import React, { useState, useEffect } from 'react';
import { HERO_SLIDES } from '../../data/cricketData';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface HeroCarouselProps {
  onSelectCategory: (category: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onSelectCategory }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = HERO_SLIDES[current];

  return (
    <div
      className="relative w-full h-[65vh] sm:h-[75vh] lg:h-[82vh] overflow-hidden bg-black select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with smooth fade */}
      <div className="absolute inset-0">
        <picture>
          <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
          <img
            src={slide.desktopImage}
            alt={slide.title}
            className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out scale-100 group-hover:scale-102"
          />
        </picture>
        {/* Subtle vignette gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 md:bg-gradient-to-r md:from-black/85 md:via-black/40 md:to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative max-w-7xl mx-auto h-full px-6 sm:px-12 flex flex-col justify-end md:justify-center pb-14 md:pb-0 z-10">
        <div className="max-w-xl text-white">
          <div className="inline-flex items-center space-x-2 bg-[#ccff00] text-black px-2.5 py-1 rounded text-[10px] font-black tracking-widest uppercase mb-3">
            <span>OFFICIAL LAUNCH</span>
            <span>•</span>
            <span>2026 RANGE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase font-mono leading-none mb-2 text-white drop-shadow-md">
            {slide.title}
          </h1>

          <p className="text-sm sm:text-lg font-bold text-neutral-200 tracking-wide uppercase mb-1 drop-shadow">
            {slide.subtitle}
          </p>

          <p className="text-xs sm:text-sm text-neutral-300 font-medium tracking-normal mb-6 max-w-md hidden sm:block">
            {slide.tagline}
          </p>

          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={() => slide.categoryFilter && onSelectCategory(slide.categoryFilter)}
              className="bg-[#ccff00] hover:bg-[#b5e600] text-black font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full uppercase tracking-wider transition-all transform active:scale-95 flex items-center space-x-2 shadow-lg shadow-[#ccff00]/20 cursor-pointer"
            >
              <span>{slide.buttonText}</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => onSelectCategory('All')}
              className="bg-black/60 backdrop-blur-md hover:bg-black/90 text-white border border-white/30 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-full uppercase tracking-wider transition-colors cursor-pointer"
            >
              View All Gear
            </button>
          </div>
        </div>
      </div>

      {/* Left/Right Carousel Controls */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black text-white border border-neutral-700 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={() => setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black text-white border border-neutral-700 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Slide Indicators & Progress Bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center space-x-2.5 z-20">
        {HERO_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              current === idx ? 'w-10 bg-[#ccff00]' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
