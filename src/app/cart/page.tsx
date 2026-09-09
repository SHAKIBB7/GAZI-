"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  X,
} from "lucide-react";
import { useCartStore, KNOCKING_SERVICE_PRICE } from "@/lib/store/cart-store";
import { formatBDT } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ success: boolean; text: string } | null>(null);

  const {
    items,
    removeItem,
    updateQuantity,
    toggleKnockingService,
    couponCode,
    applyCoupon,
    removeCoupon,
    shippingDivision,
    setShippingDivision,
    shippingFee,
    getSubtotal,
    getKnockingTotal,
    getGrandTotal,
    discountPercentage,
    discountAmount,
  } = useCartStore();

  const subtotal = getSubtotal();
  const knockingTotal = getKnockingTotal();
  const grandTotal = getGrandTotal();

  let computedDiscount = discountAmount;
  if (discountPercentage > 0) {
    computedDiscount += (subtotal * discountPercentage) / 100;
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMessage({ success: res.success, text: res.message });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-4xl mx-auto mb-4">
          🏏
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">
          Your Cricket Kit Bag is Empty
        </h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          Looks like you haven&apos;t added any bats, match balls, or protective gear to your bag yet.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full cricket-gradient text-white text-xs font-bold shadow-md hover:brightness-110 transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Browse Cricket Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8">
          Your Cricket Kit Bag ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => {
              const itemBasePrice = item.product.discountPrice || item.product.basePrice;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-5"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-24 rounded-xl bg-slate-50 flex items-center justify-center text-4xl flex-shrink-0">
                    {item.product.category.slug === "cricket-bats" ? "🏏" : "🔴"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-cricket-pitch tracking-wider">
                          {item.product.brand.name}
                        </span>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="block text-sm font-bold text-slate-900 hover:text-cricket-pitch transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-cricket-leather p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Specs info */}
                    <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                      {item.selectedSize && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                          Size: {item.selectedSize}
                        </span>
                      )}
                      {item.selectedWeight && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                          Weight: {item.selectedWeight}
                        </span>
                      )}
                    </div>

                    {/* Knocking Addon Toggle */}
                    {item.product.hasKnockingOption && (
                      <div className="pt-2 border-t border-slate-100">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-950">
                          <input
                            type="checkbox"
                            checked={item.addKnockingService}
                            onChange={() => toggleKnockingService(item.id)}
                            className="w-4 h-4 rounded text-cricket-pitch focus:ring-cricket-pitch"
                          />
                          <span className="flex items-center gap-1">
                            <span>Add Pro Knocking & Oiling Lab Service</span>
                            <span className="text-cricket-gold font-bold">
                              (+{formatBDT(KNOCKING_SERVICE_PRICE)})
                            </span>
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Bottom Row: Quantity & Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-xs"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-black text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-xs"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-slate-900">
                          {formatBDT((itemBasePrice + item.knockingServiceFee) * item.quantity)}
                        </div>
                        {item.knockingServiceFee > 0 && (
                          <div className="text-[10px] text-amber-700 font-medium">
                            Includes Knocking: {formatBDT(item.knockingServiceFee * item.quantity)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary & Checkout box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
                Order Summary
              </h3>

              {/* Shipping Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Delivery Destination in Bangladesh:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShippingDivision("Dhaka Metro")}
                    className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                      shippingDivision.includes("Dhaka")
                        ? "cricket-gradient text-white border-transparent"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div>Inside Dhaka</div>
                    <div className="text-[10px] opacity-80">৳80 (24h)</div>
                  </button>
                  <button
                    onClick={() => setShippingDivision("Outside Dhaka")}
                    className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                      !shippingDivision.includes("Dhaka")
                        ? "cricket-gradient text-white border-transparent"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div>Outside Dhaka</div>
                    <div className="text-[10px] opacity-80">৳150 (48h)</div>
                  </button>
                </div>
              </div>

              {/* Coupon Form */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Promotional Coupon Code:
                </label>
                {couponCode ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      Applied: {couponCode}
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Try 'CRICKET10'"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cricket-pitch uppercase font-bold"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponMessage && (
                  <p
                    className={`text-xs mt-1.5 font-semibold ${
                      couponMessage.success ? "text-emerald-600" : "text-cricket-leather"
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Equipment Subtotal</span>
                  <span className="font-bold text-slate-900">{formatBDT(subtotal)}</span>
                </div>
                {knockingTotal > 0 && (
                  <div className="flex justify-between text-amber-900">
                    <span>Pro Knocking & Oiling</span>
                    <span className="font-bold">+{formatBDT(knockingTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee ({shippingDivision})</span>
                  <span className="font-bold text-slate-900">{formatBDT(shippingFee)}</span>
                </div>
                {computedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-{formatBDT(computedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-xl text-cricket-pitch">{formatBDT(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => router.push("/checkout")}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl cricket-gradient text-white text-sm font-black shadow-lg shadow-cricket-pitch/40 hover:brightness-110 transition-all"
              >
                <span>Proceed to Fast Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-slate-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-cricket-pitch" />
                <span>SSL Encrypted Checkout • COD Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
