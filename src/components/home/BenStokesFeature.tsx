import React from 'react';
import { PRODUCTS } from '../../data/cricketData';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types/cricket';
import { ArrowRight, Star, ShoppingBag, Eye } from 'lucide-react';

interface BenStokesFeatureProps {
  onSelectProduct: (product: Product) => void;
  onFilterBrand: (brand: string) => void;
}

export const BenStokesFeature: React.FC<BenStokesFeatureProps> = ({
  onSelectProduct,
  onFilterBrand,
}) => {
  const { formatPrice, addToCart } = useCart();

  // The 4 products belonging to the Diamond Ben Stokes collection
  const stokesProducts = PRODUCTS.filter((p) =>
    ['4012944', '4012945', '4012946', '4012947'].includes(p.id)
  );

  return (
    <section className="bg-neutral-950 text-white py-16 px-4 border-y border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Top Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 bg-neutral-900 border border-neutral-700 px-3 py-1 rounded-full text-[10px] font-black uppercase text-[#ccff00] tracking-widest mb-3">
            <Star size={12} className="fill-[#ccff00]" />
            <span>PLAYER EXCLUSIVE SPOTLIGHT</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight font-mono mb-3">
            GET THE BEN STOKES LOOK
          </h2>
          <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
            Trusted by England Test captain Ben Stokes, the Gunn & Moore Diamond Signature series is designed for cricketers who take the game on. Featuring an aggressive shorter blade, thicker profile, and oversized sweet spot, the Diamond profile delivers effortless pick-up and monstrous hitting power.
          </p>
          <div className="mt-4">
            <button
              onClick={() => onFilterBrand('Gunn & Moore')}
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#ccff00] hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Explore All Gunn & Moore Bats</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Split Grid: Large Editorial Hero + 4-item showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Big Banner Image */}
          <div className="lg:col-span-5 relative group overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl">
            <img
              src="https://www.prodirectsport.com/cdn/shop/files/Ben_Stokes_Bat_100926.jpg?v=1789034878&width=2000"
              alt="Gunn & Moore Ben Stokes Diamond Cricket Bat"
              className="w-full h-[380px] sm:h-[480px] lg:h-[580px] object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
              <span className="text-[#ccff00] font-black text-xs uppercase tracking-widest mb-1">
                HANDCRAFTED IN NOTTINGHAM
              </span>
              <h3 className="text-2xl font-black uppercase font-mono text-white leading-tight">
                GM DIAMOND SIGNATURE
              </h3>
              <p className="text-neutral-300 text-xs mt-1 mb-4">
                Engineered for fearless stroke play. Available in Limited Edition Grade 1+ English Willow.
              </p>
              <button
                onClick={() => {
                  const bat = PRODUCTS.find((p) => p.id === '4012944');
                  if (bat) onSelectProduct(bat);
                }}
                className="bg-white hover:bg-neutral-200 text-black font-extrabold text-xs px-5 py-2.5 rounded-full uppercase tracking-wider transition-transform active:scale-95 inline-flex items-center space-x-2 w-max cursor-pointer"
              >
                <span>Inspect Match Edition Bat</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: 4 Related Items in 2x2 Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stokesProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-neutral-900/90 rounded-xl p-4 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between group shadow-lg"
              >
                {/* Image Box */}
                <div
                  className="relative aspect-square w-full bg-neutral-950 rounded-lg overflow-hidden flex items-center justify-center p-3 cursor-pointer"
                  onClick={() => onSelectProduct(prod)}
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  {prod.oldPrice && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                      SALE
                    </span>
                  )}
                  {prod.isExclusive && (
                    <span className="absolute top-2 right-2 bg-[#ccff00] text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                      LIMITED
                    </span>
                  )}
                </div>

                {/* Info Box */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                    <span className="uppercase font-bold tracking-wider">{prod.vendor}</span>
                    <span className="text-amber-400 flex items-center space-x-0.5 text-[10px]">
                      ★ {prod.rating} ({prod.reviewsCount})
                    </span>
                  </div>

                  <h4
                    className="text-white text-xs font-bold leading-snug hover:text-[#ccff00] transition-colors cursor-pointer line-clamp-1"
                    onClick={() => onSelectProduct(prod)}
                  >
                    {prod.title}
                  </h4>

                  <div className="flex items-baseline space-x-2 mt-1.5">
                    <span className="text-sm font-extrabold text-white">
                      {formatPrice(prod.price)}
                    </span>
                    {prod.oldPrice && (
                      <span className="text-xs text-neutral-500 line-through">
                        {formatPrice(prod.oldPrice)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-neutral-800">
                    <button
                      onClick={() => onSelectProduct(prod)}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold rounded uppercase transition-colors cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => addToCart(prod)}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-[#ccff00] hover:bg-[#b8e600] text-black text-[11px] font-black rounded uppercase transition-transform active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag size={12} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
