import React, { useState } from 'react';
import { Product } from '../../types/cricket';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { X, Heart, Star, ShoppingBag, Truck, RotateCcw, Check } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

interface QuickViewContentProps {
  product: Product;
  onClose: () => void;
}

const QuickViewModalContent: React.FC<QuickViewContentProps> = ({ product, onClose }) => {
  const { formatPrice, addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const savings = product.oldPrice ? product.oldPrice - product.price : 0;
  const currentImg = product.images[activeImageIndex] || product.images[0];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white text-neutral-900 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row my-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center z-20 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Left Column: Image Gallery */}
        <div className="w-full md:w-1/2 bg-neutral-100 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-200">
          {/* Main Photo View */}
          <div className="relative aspect-square w-full flex items-center justify-center overflow-hidden rounded-xl bg-white p-4">
            <img
              src={currentImg}
              alt={product.title}
              className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-110"
            />
            {product.oldPrice && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded uppercase tracking-wider">
                SALE - SAVE {formatPrice(savings)}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center space-x-2 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-16 h-16 rounded-lg bg-white p-1 border-2 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === i
                      ? 'border-black shadow-md'
                      : 'border-neutral-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Guarantees */}
          <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-2 gap-2 text-[11px] text-neutral-600">
            <div className="flex items-center space-x-1.5">
              <Truck size={14} className="text-black shrink-0" />
              <span>Dhaka Express Dispatch</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <RotateCcw size={14} className="text-black shrink-0" />
              <span>7-Day Replacement Policy</span>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">
              <span>{product.vendor} • {product.category}</span>
              <div className="flex items-center space-x-1 text-amber-500">
                <Star size={13} className="fill-amber-400" />
                <span className="font-bold">{product.rating}</span>
                <span className="text-neutral-400 font-normal">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight uppercase font-mono">
              {product.title}
            </h2>

            <p className="text-xs text-neutral-500 mt-1 mb-3">
              Colour: <strong className="text-neutral-800">{product.color}</strong>
            </p>

            {/* Price Box */}
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex items-baseline space-x-3 mb-4">
              <span className="text-2xl font-black text-neutral-900 font-mono">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  RRP {formatPrice(product.oldPrice)}
                </span>
              )}
              <span className="text-[11px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded ml-auto">
                In Stock (Dhaka Hub)
              </span>
            </div>

            {/* Bangladesh Payment Notice */}
            <div className="text-[11px] text-neutral-800 mb-4 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between">
              <span>ক্যাশ অন ডেলিভারি (COD), বিকাশ ও নগদ পেমেন্ট প্রযোজ্য</span>
              <span className="font-bold text-emerald-700">সারা বাংলাদেশ</span>
            </div>

            {/* Size Selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-900 mb-2">
                <span>SELECT SIZE / SPEC:</span>
                <span className="text-neutral-500 text-[11px] underline cursor-pointer">
                  Size Guide
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-black text-[#ccff00] ring-2 ring-black shadow'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 mb-1">
                Product Overview
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed max-h-24 overflow-y-auto">
                {product.description}
              </p>
            </div>

            {/* Technical Specs Table */}
            {product.specs && (
              <div className="mb-6 border border-neutral-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-neutral-100 px-3 py-1.5 font-bold uppercase text-[10px] text-neutral-700">
                  Technical Specifications
                </div>
                <div className="divide-y divide-neutral-100">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="px-3 py-1.5 flex justify-between bg-white">
                      <span className="text-neutral-500 font-medium">{key}</span>
                      <span className="text-neutral-900 font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-neutral-200 flex items-center space-x-3">
            {/* Quantity */}
            <div className="flex items-center border border-neutral-300 rounded-xl bg-neutral-50 px-2 py-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2 py-1 text-sm font-bold text-neutral-600 hover:text-black cursor-pointer"
              >
                -
              </button>
              <span className="px-3 text-xs font-bold text-neutral-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2 py-1 text-sm font-bold text-neutral-600 hover:text-black cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Add to Bag */}
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all transform active:scale-98 cursor-pointer ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#ccff00] hover:bg-[#b5e600] text-black shadow-lg shadow-[#ccff00]/20'
              }`}
            >
              {added ? (
                <>
                  <Check size={16} />
                  <span>Added {quantity} to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>ADD TO SHOPPING BAG</span>
                </>
              )}
            </button>

            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
              }`}
              aria-label="Wishlist"
            >
              <Heart size={18} className={isFavorite ? 'fill-red-600' : ''} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  if (!product) return null;
  return <QuickViewModalContent product={product} onClose={onClose} />;
};

