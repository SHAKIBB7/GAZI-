"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingCart,
  Zap,
  CheckCircle2,
  Info,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { CRICKET_PRODUCTS, CricketProduct } from "@/lib/data/cricket-products";
import { useCartStore, KNOCKING_SERVICE_PRICE } from "@/lib/store/cart-store";
import { formatBDT } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const product = CRICKET_PRODUCTS.find((p) => p.slug === slug) || CRICKET_PRODUCTS[0];

  // Component state
  const [selectedSize, setSelectedSize] = useState<string>(
    product.batSpecs?.sizesAvailable[0] || "Standard Adult"
  );
  const [selectedWeight, setSelectedWeight] = useState<string>("2lb 10.5oz (1205g)");
  const [selectedHandle, setSelectedHandle] = useState<string>("Semi-Oval");
  const [addKnocking, setAddKnocking] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"specs" | "knocking" | "reviews">("specs");
  const [is360Active, setIs360Active] = useState<boolean>(false);

  const addItem = useCartStore((state) => state.addItem);

  const finalPrice = (product.discountPrice || product.basePrice) * quantity;
  const knockingPrice = (product.hasKnockingOption && addKnocking) ? KNOCKING_SERVICE_PRICE * quantity : 0;
  const totalItemCost = finalPrice + knockingPrice;

  const handleAddToCart = () => {
    addItem(product, selectedSize, selectedWeight, addKnocking);
  };

  const handleBuyNow = () => {
    addItem(product, selectedSize, selectedWeight, addKnocking);
    router.push("/checkout");
  };

  return (
    <div className="bg-slate-50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-6">
          <Link href="/" className="hover:text-cricket-pitch">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-cricket-pitch">
            {product.category.name}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Product Images / 360 View */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[480px]">
              {/* Top Badges */}
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-slate-900 text-white tracking-wider">
                  {product.brand.name}
                </span>

                <button
                  onClick={() => setIs360Active(!is360Active)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    is360Active
                      ? "bg-cricket-gold text-slate-950 shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${is360Active ? "animate-spin" : ""}`} />
                  <span>{is360Active ? "360° Spin Active" : "View 360°"}</span>
                </button>
              </div>

              {/* Main Visual Representation */}
              <div className="text-9xl py-12 select-none transform hover:scale-105 transition-transform duration-300">
                {product.category.slug === "cricket-bats"
                  ? "🏏"
                  : product.category.slug === "cricket-balls"
                  ? "🔴"
                  : "🛡️"}
              </div>

              {/* Grain & Sweet Spot HUD Overlay for Bats */}
              {product.batSpecs && (
                <div className="w-full bg-slate-900/90 text-white rounded-2xl p-4 backdrop-blur-md border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Willow Grade</div>
                    <div className="font-bold text-cricket-lime truncate">{product.batSpecs.willowGrade.split(" ")[0]}</div>
                  </div>
                  <div className="border-x border-slate-800">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Straight Grains</div>
                    <div className="font-bold text-white">{product.batSpecs.grainCount} Visible Grains</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Power Edges</div>
                    <div className="font-bold text-cricket-gold">{product.batSpecs.edgeThickness}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Trust Badges Under Image */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-3 border border-slate-200 text-center text-xs">
                <ShieldCheck className="w-5 h-5 text-cricket-pitch mx-auto mb-1" />
                <div className="font-bold text-slate-900">100% Genuine</div>
                <div className="text-[10px] text-slate-500">Master Cleft Guarantee</div>
              </div>
              <div className="bg-white rounded-2xl p-3 border border-slate-200 text-center text-xs">
                <Truck className="w-5 h-5 text-cricket-lime mx-auto mb-1" />
                <div className="font-bold text-slate-900">24-48h Delivery</div>
                <div className="text-[10px] text-slate-500">64 Districts of BD</div>
              </div>
              <div className="bg-white rounded-2xl p-3 border border-slate-200 text-center text-xs">
                <RotateCcw className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="font-bold text-slate-900">7 Days Exchange</div>
                <div className="text-[10px] text-slate-500">Weight & Size Fit</div>
              </div>
            </div>
          </div>

          {/* Right: Product Buy Box & Customizers */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              {/* Product Title & Brand */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-black uppercase text-cricket-pitch tracking-wider">
                    {product.brand.name} • {product.brand.country}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-medium">SKU: {product.sku}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-900">{product.rating}</span>
                  <span className="text-xs text-slate-500">({product.reviewCount} verified cricketer reviews)</span>
                </div>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pb-6 border-b border-slate-100">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  {formatBDT(product.discountPrice || product.basePrice)}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-lg line-through text-slate-400 font-semibold">
                      {formatBDT(product.basePrice)}
                    </span>
                    <span className="bg-cricket-leather/10 text-cricket-leather font-extrabold text-xs px-2.5 py-1 rounded-full">
                      SAVE {formatBDT(product.basePrice - product.discountPrice)}
                    </span>
                  </>
                )}
              </div>

              {/* Bat Customizers (If it's a cricket bat) */}
              {product.batSpecs && (
                <div className="space-y-4">
                  {/* Size Selector */}
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-2">
                      Bat Size: <span className="text-cricket-pitch font-bold">{selectedSize}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.batSpecs.sizesAvailable.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedSize === sz
                              ? "cricket-gradient text-white shadow-md shadow-cricket-pitch/30"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weight Selector */}
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-2">
                      Exact Weight Profile: <span className="text-cricket-pitch font-bold">{selectedWeight}</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        "2lb 8oz (1134g)",
                        "2lb 9.5oz (1176g)",
                        "2lb 10.5oz (1205g)",
                        "2lb 11.8oz (1240g)",
                      ].map((wt) => (
                        <button
                          key={wt}
                          onClick={() => setSelectedWeight(wt)}
                          className={`p-2.5 rounded-xl text-xs text-center font-bold transition-all ${
                            selectedWeight === wt
                              ? "bg-slate-900 text-white shadow-sm"
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {wt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Handle Shape */}
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-2">
                      Handle Profile: <span className="text-cricket-pitch font-bold">{selectedHandle}</span>
                    </label>
                    <div className="flex gap-2">
                      {["Round", "Semi-Oval", "Oval"].map((h) => (
                        <button
                          key={h}
                          onClick={() => setSelectedHandle(h)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedHandle === h
                              ? "bg-emerald-800 text-white shadow-sm"
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Knocking & Oiling Lab Addon Box */}
              {product.hasKnockingOption && (
                <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addKnocking}
                      onChange={(e) => setAddKnocking(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded text-cricket-pitch focus:ring-cricket-pitch cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cricket-gold" />
                          PRO KNOCKING & OILING SERVICE
                        </span>
                        <span className="text-xs font-black text-amber-900">
                          +{formatBDT(KNOCKING_SERVICE_PRICE)}
                        </span>
                      </div>
                      <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                        Includes 15,000 automated pneumatic hammer strikes, double English linseed oiling, bone mallet edge hardening, and high-density anti-scuff sheet application.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Quantity & Buy Buttons */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-sm"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-sm font-black text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-sm"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex-1 text-right">
                    <div className="text-xs text-slate-500 font-medium">Total Price:</div>
                    <div className="text-xl font-black text-slate-900">
                      {formatBDT(totalItemCost)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-black shadow-md transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl cricket-gradient text-white text-sm font-black shadow-lg shadow-cricket-pitch/40 hover:brightness-110 transition-all"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Instant Checkout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Specs, Knocking Details, Reviews */}
        <div className="mt-16 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-6 border-b border-slate-200 pb-4 text-sm font-bold text-slate-600">
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-2 transition-colors relative ${
                activeTab === "specs"
                  ? "text-cricket-pitch font-black border-b-2 border-cricket-pitch"
                  : "hover:text-slate-900"
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab("knocking")}
              className={`pb-2 transition-colors relative ${
                activeTab === "knocking"
                  ? "text-cricket-pitch font-black border-b-2 border-cricket-pitch"
                  : "hover:text-slate-900"
              }`}
            >
              Lab Knocking Process
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2 transition-colors relative ${
                activeTab === "reviews"
                  ? "text-cricket-pitch font-black border-b-2 border-cricket-pitch"
                  : "hover:text-slate-900"
              }`}
            >
              Customer Reviews ({product.reviewCount})
            </button>
          </div>

          <div className="pt-6">
            {activeTab === "specs" && (
              <div className="space-y-6">
                <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
                  {product.description}
                </p>

                {product.batSpecs && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Sweet Spot</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{product.batSpecs.sweetSpot} Profile</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Edge Profile</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{product.batSpecs.edgeThickness} Big Edges</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Spine Height</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{product.batSpecs.spineHeight}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Handle</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">Multi-Piece Cane with Rubber Inlays</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Toe Protection</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">Fitted Rubber Toe Guard & Moisture Seal</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Grip Type</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">Chevron Scale High-Traction Rubber</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "knocking" && (
              <div className="space-y-4 max-w-3xl text-sm text-slate-700 leading-relaxed">
                <h4 className="text-base font-black text-slate-900">
                  Why Professional Bat Knocking Matters
                </h4>
                <p>
                  A brand-new English willow bat is composed of uncompressed, soft willow fibers. If you play against high-pace leather balls immediately, the bat face can crack, edges can feather or shear off, and warranty is voided.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cricket-pitch flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>15,000 Automated Strikes:</strong> Our calibrated machine knocks the entire blade with progressive force without fatiguing human hands.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cricket-pitch flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Deep Edge Compaction:</strong> Hand-rolled with a hardwood bone mallet at a 45-degree angle to withstand edge-thick snicks.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cricket-pitch flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Protective Extratec Sheet:</strong> Transparent shield prevents surface cracks and moisture ingress without adding noticeable weight.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black text-slate-900">{product.rating}</div>
                  <div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                      Based on {product.reviewCount} customer reviews
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">Imran Hossain (Dhaka Premier League)</span>
                      <span className="text-slate-400">Verified Buyer</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Took this bat into the nets straight out of the box after the knocking service. Balance was spot on, pickup felt like a feather, and boundaries cleared effortlessly!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
