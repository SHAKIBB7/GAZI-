import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../../types/cricket';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart, formatPrice } = useCart();

  if (!isWishlistOpen) return null;

  const handleMoveToBag = (product: Product) => {
    addToCart(product, product.sizes[0]);
    toggleWishlist(product);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white text-neutral-900 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-black text-white">
          <div className="flex items-center space-x-2">
            <Heart size={20} className="text-[#ccff00] fill-[#ccff00]" />
            <h3 className="font-mono font-black text-base uppercase tracking-tight">
              SAVED GEAR ({wishlist.length})
            </h3>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Close wishlist"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-neutral-100">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                <Heart size={30} />
              </div>
              <h4 className="text-base font-bold text-neutral-900 mb-1">
                Your wishlist is empty
              </h4>
              <p className="text-xs text-neutral-500 mb-6 max-w-xs">
                Save your favourite cricket bats, spiked footwear, and protective equipment here to review or purchase later.
              </p>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="bg-black text-[#ccff00] hover:bg-neutral-800 text-xs font-black uppercase tracking-wider px-6 py-3 rounded-full transition-colors cursor-pointer"
              >
                Explore Catalog
              </button>
            </div>
          ) : (
            wishlist.map((prod) => (
              <div key={prod.id} className="py-4 flex space-x-3.5 items-center">
                <img
                  src={prod.images[0]}
                  alt={prod.title}
                  className="w-20 h-20 object-contain bg-neutral-100 rounded-lg p-1.5 border border-neutral-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-neutral-500">
                    {prod.vendor}
                  </span>
                  <h5 className="text-xs font-bold text-neutral-900 truncate">
                    {prod.title}
                  </h5>
                  <div className="text-xs font-black text-neutral-900 mt-1">
                    {formatPrice(prod.price)}
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => handleMoveToBag(prod)}
                      className="bg-black text-[#ccff00] hover:bg-neutral-800 text-[11px] font-bold px-3 py-1.5 rounded uppercase flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <ShoppingBag size={12} />
                      <span>Move to Bag</span>
                    </button>
                    <button
                      onClick={() => toggleWishlist(prod)}
                      className="text-neutral-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {wishlist.length > 0 && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-between items-center">
            <button
              onClick={clearWishlist}
              className="text-xs font-bold text-neutral-500 hover:text-red-600 transition-colors"
            >
              Clear All Saved Items
            </button>
            <button
              onClick={() => {
                wishlist.forEach((p) => addToCart(p, p.sizes[0]));
                clearWishlist();
              }}
              className="bg-black text-white hover:bg-neutral-800 text-xs font-black uppercase px-4 py-2.5 rounded-lg"
            >
              Move All to Bag
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
