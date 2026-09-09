"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Smartphone,
  Check,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { formatBDT } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    shippingDivision,
    shippingFee,
    getSubtotal,
    getKnockingTotal,
    getGrandTotal,
    clearCart,
  } = useCartStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [division, setDivision] = useState(shippingDivision || "Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [thana, setThana] = useState("Mirpur");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "sslcommerz" | "cod">("bkash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const knockingTotal = getKnockingTotal();
  const grandTotal = getGrandTotal();

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert("Please fill in your name, contact phone number, and delivery address.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedOrderNumber = `CSP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderConfirmed(generatedOrderNumber);
      clearCart();
      setIsSubmitting(false);
    }, 1500);
  };

  if (orderConfirmed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          <Check className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Thank you for choosing Cricket Store Pro. Your equipment is being prepared at our fulfillment hub.
        </p>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-left mb-8 space-y-3 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Order Reference:</span>
            <span className="font-bold text-cricket-pitch text-sm">{orderConfirmed}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Payment Gateway:</span>
            <span className="font-bold uppercase text-slate-900">{paymentMethod}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Estimated Delivery:</span>
            <span className="font-bold text-slate-900">24-48 Hours via Steadfast Courier</span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-black text-slate-900">
            <span>Total Payable:</span>
            <span>{formatBDT(grandTotal || 38580)}</span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-full cricket-gradient text-white font-bold text-xs shadow-md"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6 text-xs text-slate-500 font-semibold">
          <Link href="/cart" className="flex items-center gap-1 hover:text-cricket-pitch">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Bag</span>
          </Link>
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8">
          Express Checkout & Shipping
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Customer & Address Information */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Details Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-cricket-pitch" />
                <span>1. Shipping Information (Bangladesh)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shakib Ahmed"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-cricket-pitch font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (for Courier SMS) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-cricket-pitch font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address (for Invoice)
                </label>
                <input
                  type="email"
                  placeholder="cricketer@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-cricket-pitch font-medium"
                />
              </div>

              {/* Bangladesh Divisions & Districts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Division
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-cricket-pitch font-medium"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Barishal">Barishal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    District / City
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Dhaka, Gazipur"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-cricket-pitch font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thana / Upazila
                  </label>
                  <input
                    type="text"
                    required
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    placeholder="e.g. Mirpur, Gulshan"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-cricket-pitch font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Street Address & Landmark *
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Road #, Area, Landmark near cricket club..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-cricket-pitch font-medium"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cricket-pitch" />
                <span>2. Select Payment Gateway</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* bKash */}
                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === "bkash"
                      ? "border-pink-600 bg-pink-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bkash"
                    checked={paymentMethod === "bkash"}
                    onChange={() => setPaymentMethod("bkash")}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      bKash Direct PGW
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Instant payment via bKash App or PIN
                    </div>
                  </div>
                </label>

                {/* Nagad */}
                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === "nagad"
                      ? "border-orange-600 bg-orange-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="nagad"
                    checked={paymentMethod === "nagad"}
                    onChange={() => setPaymentMethod("nagad")}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      Nagad MFS
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Zero convenience charge
                    </div>
                  </div>
                </label>

                {/* SSLCommerz */}
                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === "sslcommerz"
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="sslcommerz"
                    checked={paymentMethod === "sslcommerz"}
                    onChange={() => setPaymentMethod("sslcommerz")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      SSLCommerz
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Visa, Mastercard, Amex, Internet Banking
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === "cod"
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      Cash on Delivery (COD)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Pay courier upon physical bat inspection
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 sticky top-24">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
                Your Order ({items.length} items)
              </h3>

              {/* Items Mini List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                      🏏
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Qty: {item.quantity} • {item.selectedSize}
                        {item.addKnockingService && " • Knocking Included"}
                      </div>
                    </div>
                    <div className="font-black text-slate-900">
                      {formatBDT(
                        ((item.product.discountPrice || item.product.basePrice) +
                          item.knockingServiceFee) *
                          item.quantity
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Summary */}
              <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatBDT(subtotal)}</span>
                </div>
                {knockingTotal > 0 && (
                  <div className="flex justify-between text-amber-900">
                    <span>Knocking & Oiling Lab</span>
                    <span className="font-bold">+{formatBDT(knockingTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Courier Shipping Fee</span>
                  <span className="font-bold text-slate-900">{formatBDT(shippingFee)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-xl text-cricket-pitch">{formatBDT(grandTotal)}</span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl cricket-gradient text-white text-sm font-black shadow-lg shadow-cricket-pitch/40 hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <span>Confirm & Pay {formatBDT(grandTotal)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-400 text-center space-y-1">
                <p>🔒 256-Bit Bank Grade SSL Encryption</p>
                <p>Authorised Cricket Equipment Guaranteed</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
