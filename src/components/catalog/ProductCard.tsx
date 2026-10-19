import React, { useState } from 'react';
import { Product } from '../../types/cricket';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, Star, ShoppingBag, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { formatPrice, addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [isHovered, setIsHovered] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const hasMultipleImages = product.images.length > 1;
  const currentImage = isHovered && hasMultipleImages ? product.images[1] : product.images[0];

  const savings = product.oldPrice ? product.oldPrice - product.price : 0;

  const handleSizeClick = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    addToCart(product, size);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      className="group relative bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowSizes(false);
      }}
    >
      {/* Top Image Container */}
      <div
        className="relative aspect-square w-full bg-neutral-100 overflow-hidden flex items-center justify-center p-4 cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={currentImage}
          alt={product.title}
          className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.oldPrice && (
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow">
              SALE {savings > 0 && `(SAVE ${formatPrice(savings)})`}
            </span>
          )}
          {product.isNew && (
            <span className="bg-neutral-900 text-[#ccff00] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow">
              NEW 2026
            </span>
          )}
          {product.isExclusive && (
            <span className="bg-[#ccff00] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow">
              EXCLUSIVE
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer shadow-sm ${
            isFavorite
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/80 hover:bg-white text-neutral-600 hover:text-black'
          }`}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} className={isFavorite ? 'fill-white' : ''} />
        </button>

        {/* Quick View Button on Image Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 hover:bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow"
        >
          <Eye size={13} />
          <span>Quick View</span>
        </button>

        {/* Slide-up Quick Add Size Drawer on Image */}
        {showSizes && (
          <div
            className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md p-3 border-t border-neutral-200 z-20 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 mb-2">
              <span>SELECT SIZE TO ADD:</span>
              <button
                onClick={() => setShowSizes(false)}
                className="text-neutral-400 hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={(e) => handleSizeClick(e, sz)}
                  className="bg-neutral-100 hover:bg-black hover:text-[#ccff00] border border-neutral-300 text-neutral-800 text-xs font-bold px-2 py-1 rounded transition-colors"
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details Box */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
            <span>{product.vendor}</span>
            <div className="flex items-center space-x-1 text-amber-500 text-[10px]">
              <Star size={11} className="fill-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h3
            onClick={() => onQuickView(product)}
            className="text-sm font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors line-clamp-2 leading-snug cursor-pointer min-h-[2.5rem]"
          >
            {product.title}
          </h3>

          <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
            {product.color}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <div className="flex items-baseline space-x-2 mb-3">
            <span className="text-base sm:text-lg font-black text-neutral-900">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => {
              if (product.sizes.length > 1) {
                setShowSizes(true);
              } else {
                addToCart(product, product.sizes[0]);
                setJustAdded(true);
                setTimeout(() => setJustAdded(false), 1500);
              }
            }}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-black text-[#ccff00] hover:bg-neutral-800 active:scale-98'
            }`}
          >
            {justAdded ? (
              <>
                <Check size={14} />
                <span>Added to Bag!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
