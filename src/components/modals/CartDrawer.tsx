import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Minus, CheckCircle, Truck } from 'lucide-react';
import { apiService, CheckoutResult } from '../../services/api';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    shipping,
    grandTotal,
    freeShippingThreshold,
    freeShippingRemaining,
    formatPrice,
    promoCode,
    applyPromoCode,
    removePromoCode,
    currency,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoError, setPromoError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<CheckoutResult['order'] | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  if (!isCartOpen) return null;

  const progressPercent = Math.min(
    100,
    ((freeShippingThreshold - freeShippingRemaining) / freeShippingThreshold) * 100
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const success = applyPromoCode(inputCode);
    if (!success) {
      setPromoError(true);
      setTimeout(() => setPromoError(false), 2500);
    } else {
      setInputCode('');
      setPromoError(false);
    }
  };

  const handleCheckout = () => {
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => {
          setIsCartOpen(false);
          setConfirmedOrder(null);
        }}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white text-neutral-900 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-black text-white">
          <div className="flex items-center space-x-2">
            <ShoppingBag size={20} className="text-[#ccff00]" />
            <h3 className="font-mono font-black text-base uppercase tracking-tight">
              {confirmedOrder ? 'ORDER CONFIRMATION' : `YOUR SHOPPING BAG (${cart.reduce((s, i) => s + i.quantity, 0)})`}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setConfirmedOrder(null);
            }}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Close bag"
          >
            <X size={18} />
          </button>
        </div>

        {/* If Order Confirmed View */}
        {confirmedOrder ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle size={36} />
            </div>

            <span className="text-[10px] font-black uppercase text-[#88b800] bg-neutral-950 px-2.5 py-1 rounded tracking-widest mb-2">
              DISPATCH QUEUED
            </span>

            <h3 className="text-2xl font-black uppercase font-mono text-neutral-900 mb-1">
              ORDER CONFIRMED! (অর্ডার নিশ্চিত হয়েছে)
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs mb-6">
              Thank you for ordering with Gazi Cricket. Your equipment is being prepared for immediate dispatch from our Dhaka Mirpur-2 Fulfillment Hub.
            </p>

            {/* Tracking Reference Box */}
            <div className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-left space-y-2.5 mb-6 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <span className="text-neutral-500 font-bold">Tracking Number:</span>
                <span className="font-mono font-extrabold text-black bg-neutral-200 px-2 py-0.5 rounded">
                  {confirmedOrder.trackingNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-bold">Carrier / Logistics:</span>
                <span className="font-bold text-neutral-900 flex items-center space-x-1">
                  <Truck size={14} className="text-black" />
                  <span>{confirmedOrder.courier}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-bold">Estimated Delivery:</span>
                <span className="font-bold text-emerald-700">{confirmedOrder.estimatedDelivery}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
                <span className="text-neutral-500 font-bold">Total Amount:</span>
                <span className="font-mono font-black text-sm text-neutral-900">
                  {formatPrice(confirmedOrder.financials.total)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setConfirmedOrder(null);
                setIsCartOpen(false);
              }}
              className="w-full bg-black hover:bg-neutral-800 text-[#ccff00] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
            >
              Back to Equipment Store
            </button>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress Indicator */}
            <div className="bg-neutral-100 p-3.5 border-b border-neutral-200">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                {freeShippingRemaining > 0 ? (
                  <span className="text-neutral-700">
                    Add <strong className="text-black">{formatPrice(freeShippingRemaining)}</strong> more for <span className="text-emerald-600 font-black">FREE BANGLADESH DELIVERY</span>!
                  </span>
                ) : (
                  <span className="text-emerald-700 font-black flex items-center space-x-1">
                    <span>🎉</span>
                    <span>YOU HAVE UNLOCKED FREE BANGLADESH DELIVERY!</span>
                  </span>
                )}
                <span className="text-[10px] text-neutral-500 font-mono">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="w-full bg-neutral-300 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Item List */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-neutral-100">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                    <ShoppingBag size={30} />
                  </div>
                  <h4 className="text-base font-bold text-neutral-900 mb-1">
                    Your bag is empty
                  </h4>
                  <p className="text-xs text-neutral-500 mb-6 max-w-xs">
                    Explore our 2026 cricket collection and gear up with match-ready willow, spikes, and protection.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-black text-[#ccff00] hover:bg-neutral-800 text-xs font-black uppercase tracking-wider px-6 py-3 rounded-full transition-colors cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}`} className="py-4 flex space-x-3.5">
                    {/* Product thumbnail */}
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-20 h-20 object-contain bg-neutral-100 rounded-lg p-1.5 border border-neutral-200 shrink-0"
                    />

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                            {item.product.vendor}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                            className="text-neutral-400 hover:text-red-500 p-0.5 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <h5 className="text-xs font-bold text-neutral-900 truncate">
                          {item.product.title}
                        </h5>

                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Size: <strong className="text-neutral-800">{item.selectedSize}</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-neutral-300 rounded-md bg-neutral-50">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                            className="p-1 hover:bg-neutral-200 text-neutral-600 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-neutral-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                            className="p-1 hover:bg-neutral-200 text-neutral-600 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-xs font-black text-neutral-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer with totals and checkout */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-200 p-4 bg-neutral-50 space-y-3">
                {/* Promo Code Box */}
                {promoCode ? (
                  <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-lg flex items-center justify-between text-xs text-emerald-800 font-semibold">
                    <div className="flex items-center space-x-1.5">
                      <Tag size={13} className="text-emerald-600" />
                      <span>Promo 'CRICKET10' (10% Off) applied!</span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-neutral-500 hover:text-red-500 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex space-x-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Promo Code (try: CRICKET10)"
                      className="flex-1 bg-white border border-neutral-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-black uppercase font-medium"
                    />
                    <button
                      type="submit"
                      className="bg-neutral-900 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-[11px] text-red-600 font-semibold">
                    Invalid promo code. Use <strong>CRICKET10</strong> for 10% off.
                  </p>
                )}

                {/* Calculations Breakdown */}
                <div className="space-y-1.5 text-xs text-neutral-600 pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount (10%)</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-bold text-neutral-900">
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-black">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-neutral-200">
                    <span>Total</span>
                    <span className="text-base text-black font-mono">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => setIsCheckoutModalOpen(true)}
                  disabled={isSubmitting}
                  className="w-full bg-[#ccff00] hover:bg-[#b5e600] text-black font-black text-xs sm:text-sm py-3.5 rounded-xl uppercase tracking-wider transition-all transform active:scale-98 flex items-center justify-center space-x-2 shadow-lg shadow-[#ccff00]/20 cursor-pointer"
                >
                  <span>PROCEED TO CHECKOUT (ক্যাশ অন ডেলিভারি / বিকাশ)</span>
                  <ArrowRight size={16} />
                </button>

                {/* Security note */}
                <div className="flex items-center justify-center space-x-1.5 text-[10px] text-neutral-500 pt-1">
                  <ShieldCheck size={12} className="text-neutral-400" />
                  <span>256-Bit SSL Secured • Cash on Delivery • bKash • Nagad • Cards</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bangladesh Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderSuccess={(order) => {
          setConfirmedOrder(order);
          setIsCheckoutModalOpen(false);
        }}
      />
    </div>
  );
};
