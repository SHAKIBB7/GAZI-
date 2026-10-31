import React, { useState, useEffect } from 'react';
import { Product } from '../../types/cricket';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { X, Heart, Star, ShoppingBag, Truck, RotateCcw, Check, ShieldCheck, Clock, Share2, Copy } from 'lucide-react';
import { getEstimatedDeliveryText } from '../../utils/bangladesh';

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
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeGuideTab, setSizeGuideTab] = useState<'bats' | 'pads' | 'shoes'>('bats');
  const [copiedLink, setCopiedLink] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const savings = product.oldPrice ? product.oldPrice - product.price : 0;
  const currentImg = product.images[activeImageIndex] || product.images[0];
  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const isLowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 4;

  const deliveryInside = getEstimatedDeliveryText('inside_dhaka');
  const deliveryOutside = getEstimatedDeliveryText('outside_dhaka');

  // Sync product ID with URL hash for instant sharing
  useEffect(() => {
    if (typeof window !== 'undefined' && product?.id) {
      if (!window.location.hash.startsWith('#product=')) {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}#product=${product.id}`
        );
      }
    }
  }, [product]);

  const handleShareProduct = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}${window.location.pathname}#product=${product.id}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
    setAdded(true);
    // Gracefully close QuickView so CartDrawer slides in cleanly without double-backdrop collision
    setTimeout(() => {
      onClose();
    }, 250);
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
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span>১০০% অফিসিয়াল ক্রিকেট গিয়ার</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <RotateCcw size={14} className="text-black shrink-0" />
              <span>৭-দিনের রিপ্লেসমেন্ট পলিসি</span>
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
              {isOutOfStock ? (
                <span className="text-[11px] text-red-700 bg-red-100 font-bold px-2.5 py-0.5 rounded ml-auto">
                  Stock Out (স্টক নেই)
                </span>
              ) : isLowStock ? (
                <span className="text-[11px] text-amber-800 bg-amber-100 font-bold px-2.5 py-0.5 rounded ml-auto animate-pulse">
                  Only {product.stock} Left! (সীমিত স্টক)
                </span>
              ) : (
                <span className="text-[11px] text-emerald-700 bg-emerald-100 font-bold px-2.5 py-0.5 rounded ml-auto">
                  In Stock (Narsingdi Stadium Hub)
                </span>
              )}
            </div>

            {/* Bangladesh Delivery & Payment Estimates */}
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80 text-xs mb-4 space-y-2">
              <div className="flex items-center justify-between font-bold text-neutral-900 pb-1.5 border-b border-emerald-200/60">
                <div className="flex items-center space-x-1.5 text-emerald-800">
                  <Truck size={14} className="text-emerald-700" />
                  <span>এক্সপ্রেস ডেলিভারি (Estimated Delivery)</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-1.5 py-0.5 rounded">
                  ক্যাশ অন ডেলিভারি
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-neutral-700">
                <div>
                  <span className="text-neutral-500 block">ঢাকা ও নরসিংদী:</span>
                  <strong className="text-neutral-900 font-semibold">{deliveryInside.rangeBn}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">ঢাকার বাইরে (সারাদেশ):</span>
                  <strong className="text-neutral-900 font-semibold">{deliveryOutside.rangeBn}</strong>
                </div>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-900 mb-2">
                <span>SELECT SIZE / SPEC:</span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-neutral-600 hover:text-black font-semibold text-[11px] underline cursor-pointer"
                >
                  Size Guide (সাইজ গাইড)
                </button>
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

            {/* Add to Bag or Out of Stock */}
            {isOutOfStock ? (
              <button
                disabled
                className="flex-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center space-x-2 bg-neutral-200 text-neutral-500 cursor-not-allowed"
              >
                <span>CURRENTLY OUT OF STOCK (স্টক শেষ)</span>
              </button>
            ) : (
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
            )}

            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
              }`}
              title={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label="Wishlist"
            >
              <Heart size={18} className={isFavorite ? 'fill-red-600' : ''} />
            </button>

            {/* Share Product Direct Link */}
            <button
              type="button"
              onClick={handleShareProduct}
              className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                copiedLink
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
              }`}
              title="Copy direct product link for WhatsApp / Facebook"
              aria-label="Share product link"
            >
              {copiedLink ? (
                <>
                  <Check size={18} className="text-emerald-600" />
                  <span className="text-[11px] font-bold text-emerald-700 hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  <span className="text-[11px] font-bold hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Cricket Sizing Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSizeGuideOpen(false)} />
          <div className="relative w-full max-w-lg bg-neutral-950 text-white rounded-2xl border border-neutral-800 shadow-2xl p-5 sm:p-6 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="font-mono font-black text-sm uppercase tracking-wider text-[#ccff00]">
                🏏 Cricket Equipment Sizing Guide (সাইজ গাইড)
              </h3>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-900 transition-colors cursor-pointer"
                aria-label="Close size guide"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sizing Tabs */}
            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setSizeGuideTab('bats')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                  sizeGuideTab === 'bats'
                    ? 'bg-[#ccff00] text-black font-black'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                Bats (ব্যাট)
              </button>
              <button
                type="button"
                onClick={() => setSizeGuideTab('pads')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                  sizeGuideTab === 'pads'
                    ? 'bg-[#ccff00] text-black font-black'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                Pads & Gloves (প্যাড)
              </button>
              <button
                type="button"
                onClick={() => setSizeGuideTab('shoes')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                  sizeGuideTab === 'shoes'
                    ? 'bg-[#ccff00] text-black font-black'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                Footwear (জুতো)
              </button>
            </div>

            {/* Tab Contents */}
            {sizeGuideTab === 'bats' && (
              <div className="space-y-3 text-xs">
                <p className="text-neutral-400 text-[11px]">
                  খেলোয়াড়ের উচ্চতা অনুযায়ী সঠিক ক্রিকেট ব্যাটের মাপ নির্বাচন করুন:
                </p>
                <div className="border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800">
                  <div className="bg-neutral-900 px-3 py-2 font-bold text-white grid grid-cols-3 text-[11px]">
                    <span>ব্যাটের সাইজ</span>
                    <span>খেলোয়াড়ের উচ্চতা</span>
                    <span className="text-right">ব্যাটের দৈর্ঘ্য</span>
                  </div>
                  <div className="px-3 py-2 grid grid-cols-3 text-neutral-300 text-[11px]">
                    <span className="font-bold text-white">Size 4</span>
                    <span>4' 9" - 4' 11"</span>
                    <span className="text-right">29.75"</span>
                  </div>
                  <div className="px-3 py-2 grid grid-cols-3 text-neutral-300 text-[11px]">
                    <span className="font-bold text-white">Size 5</span>
                    <span>4' 11" - 5' 2"</span>
                    <span className="text-right">30.75"</span>
                  </div>
                  <div className="px-3 py-2 grid grid-cols-3 text-neutral-300 text-[11px]">
                    <span className="font-bold text-white">Size 6</span>
                    <span>5' 2" - 5' 5"</span>
                    <span className="text-right">31.75"</span>
                  </div>
                  <div className="px-3 py-2 grid grid-cols-3 text-neutral-300 text-[11px]">
                    <span className="font-bold text-white">Harrow</span>
                    <span>5' 5" - 5' 8"</span>
                    <span className="text-right">32.75"</span>
                  </div>
                  <div className="px-3 py-2 grid grid-cols-3 text-neutral-300 text-[11px] bg-neutral-900/40">
                    <span className="font-bold text-[#ccff00]">Short Handle (SH)</span>
                    <span>5' 8" - 6' 2" (Standard)</span>
                    <span className="text-right font-bold text-[#ccff00]">33.5" (Standard)</span>
                  </div>
                  <div className="px-3 py-2 grid grid-cols-3 text-neutral-300 text-[11px]">
                    <span className="font-bold text-white">Long Handle (LH)</span>
                    <span>6' 2"+</span>
                    <span className="text-right">34.25"</span>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 pt-1">
                  * স্ট্যান্ডার্ড এডাল্ট ব্যাটের সাধারণ ওজন: 2lb 8oz থেকে 2lb 10oz (উপমহাদেশীয় উইকেটে পাওয়ার হিটিংয়ের জন্য আদর্শ)।
                </p>
              </div>
            )}

            {sizeGuideTab === 'pads' && (
              <div className="space-y-3 text-xs">
                <p className="text-neutral-400 text-[11px]">
                  পায়ের গোড়ালি থেকে হাঁটুর মধ্যভাগ (Instep to Knee Cap) মেপে সাইজ নিশ্চিত করুন:
                </p>
                <div className="border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800">
                  <div className="bg-neutral-900 px-3 py-2 font-bold text-white grid grid-cols-3 text-[11px]">
                    <span>প্যাড সাইজ</span>
                    <span>গোড়ালি-হাঁটু দৈর্ঘ্য</span>
                    <span className="text-right">উচ্চতা</span>
                  </div>
                  <div className="px-3 py-2 grid grid-cols-3 text-neutral-300 text-[11px]">
                    <span className="font-bold text-white">Junior / Boys</span>
                    <span>36 - 39 cm</span>
                    <span className="text-right">4' 6" - 5' 3"</span>
                  </div>
                  <div className="px-3 py-2 grid grid-cols-3 text-neutral-300 text-[11px]">
                    <span className="font-bold text-white">Youth</span>
                    <span>40 - 42 cm</span>
                    <span className="text-right">5' 4" - 5' 7"</span>
                  </div>
                  <div className="px-3 py-2 grid grid-cols-3 text-neutral-300 text-[11px] bg-neutral-900/40">
                    <span className="font-bold text-[#ccff00]">Standard Men's</span>
                    <span>43 - 46 cm</span>
                    <span className="text-right font-bold text-[#ccff00]">5' 8" - 6' 1"</span>
                  </div>
                  <div className="px-3 py-2 grid grid-cols-3 text-neutral-300 text-[11px]">
                    <span className="font-bold text-white">Large Men's (OS)</span>
                    <span>47+ cm</span>
                    <span className="text-right">6' 2"+</span>
                  </div>
                </div>
              </div>
            )}

            {sizeGuideTab === 'shoes' && (
              <div className="space-y-3 text-xs">
                <p className="text-neutral-400 text-[11px]">
                  ক্রিকেট স্পাইক ও টার্ফ সুজের স্ট্যান্ডার্ড ইউকে ও ইউরোপিয়ান সাইজ চার্ট:
                </p>
                <div className="border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800">
                  <div className="bg-neutral-900 px-3 py-2 font-bold text-white grid grid-cols-4 text-[11px]">
                    <span>UK Size</span>
                    <span>EU Size</span>
                    <span>US Size</span>
                    <span className="text-right">CM</span>
                  </div>
                  <div className="px-3 py-1.5 grid grid-cols-4 text-neutral-300 text-[11px]">
                    <span className="font-bold text-white">UK 7</span>
                    <span>EU 40.5</span>
                    <span>US 7.5</span>
                    <span className="text-right">25.5 cm</span>
                  </div>
                  <div className="px-3 py-1.5 grid grid-cols-4 text-neutral-300 text-[11px]">
                    <span className="font-bold text-white">UK 8</span>
                    <span>EU 42</span>
                    <span>US 8.5</span>
                    <span className="text-right">26.5 cm</span>
                  </div>
                  <div className="px-3 py-1.5 grid grid-cols-4 text-neutral-300 text-[11px] bg-neutral-900/40">
                    <span className="font-bold text-[#ccff00]">UK 8.5</span>
                    <span>EU 42.5</span>
                    <span>US 9.0</span>
                    <span className="text-right">27.0 cm</span>
                  </div>
                  <div className="px-3 py-1.5 grid grid-cols-4 text-neutral-300 text-[11px] bg-neutral-900/40">
                    <span className="font-bold text-[#ccff00]">UK 9</span>
                    <span>EU 43</span>
                    <span>US 9.5</span>
                    <span className="text-right">27.5 cm</span>
                  </div>
                  <div className="px-3 py-1.5 grid grid-cols-4 text-neutral-300 text-[11px]">
                    <span className="font-bold text-white">UK 10</span>
                    <span>EU 44.5</span>
                    <span>US 10.5</span>
                    <span className="text-right">28.5 cm</span>
                  </div>
                  <div className="px-3 py-1.5 grid grid-cols-4 text-neutral-300 text-[11px]">
                    <span className="font-bold text-white">UK 11</span>
                    <span>EU 46</span>
                    <span>US 11.5</span>
                    <span className="text-right">29.5 cm</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="bg-[#ccff00] hover:bg-[#b5e600] text-black font-extrabold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer"
              >
                ঠিক আছে (Got it)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  if (!product) return null;
  return <QuickViewModalContent product={product} onClose={onClose} />;
};

