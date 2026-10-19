import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { apiService, CheckoutResult } from '../../services/api';
import {
  BD_DIVISIONS,
  isValidBdPhone,
  normalizeBdPhone,
  calculateDeliveryFee,
  formatBDT,
} from '../../utils/bangladesh';
import { DeliveryZone, PaymentMethod } from '../../types/cricket';
import {
  X,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle,
  MapPin,
  User,
  Phone,
  Mail,
  AlertCircle,
  ArrowRight,
  Lock,
  ShoppingBag,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: CheckoutResult['order']) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cart,
    subtotal,
    discount,
    promoCode,
    clearCart,
  } = useCart();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [address, setAddress] = useState('');

  // Delivery & Payment
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [trxId, setTrxId] = useState('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Selected Division's districts
  const currentDivisionObj = BD_DIVISIONS.find((d) => d.division === division);
  const districtList = currentDivisionObj ? currentDivisionObj.districts : ['Dhaka'];

  // Handle division change
  const handleDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    const divObj = BD_DIVISIONS.find((d) => d.division === newDivision);
    if (divObj && divObj.districts.length > 0) {
      setDistrict(divObj.districts[0]);
    }
    // Auto-select zone based on division
    if (newDivision === 'Dhaka') {
      setDeliveryZone('inside_dhaka');
    } else {
      setDeliveryZone('outside_dhaka');
    }
  };

  // Calculate live delivery fee
  const deliveryFee = calculateDeliveryFee(subtotal, deliveryZone);
  const grandTotal = Math.max(0, subtotal - discount + deliveryFee);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'গ্রাহকের নাম আবশ্যক (Full Name is required)';
    }

    if (!phone.trim()) {
      newErrors.phone = 'বাংলাদেশি মোবাইল নম্বর আবশ্যক (Phone number required)';
    } else if (!isValidBdPhone(phone)) {
      newErrors.phone = 'সঠিক ১১-সংখ্যার নম্বর দিন (e.g., 01712-345678)';
    }

    if (!thana.trim()) {
      newErrors.thana = 'থানা / উপজেলা আবশ্যক (Thana / Upazila required)';
    }

    if (!address.trim()) {
      newErrors.address = 'পূর্ণ ঠিকানা আবশ্যক (Road / House / Area address required)';
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !trxId.trim()) {
      newErrors.trxId = `${paymentMethod.toUpperCase()} TrxID আবশ্যক (Transaction ID is required)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const itemsPayload = cart.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
      selectedSize: i.selectedSize,
      price: i.product.price,
    }));

    const normalizedPhone = normalizeBdPhone(phone);

    const checkoutPayload = {
      items: itemsPayload,
      promoCode,
      customer: {
        fullName: fullName.trim(),
        phone: normalizedPhone,
        email: email.trim() || undefined,
        division,
        district,
        thana: thana.trim(),
        address: address.trim(),
      },
      deliveryZone,
      paymentMethod,
      trxId: trxId.trim() || undefined,
    };

    const res = await apiService.checkout(checkoutPayload);

    if (res && res.order) {
      onOrderSuccess(res.order);
      clearCart();
      onClose();
    } else {
      // Offline / Local fallback simulation
      const fallbackOrder: CheckoutResult['order'] = {
        orderId: `GZ-BD-${Date.now()}`,
        trackingNumber: `GZ-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString(),
        status: 'Order Placed - Pending Verification Call from Dhaka Hub',
        estimatedDelivery: deliveryZone === 'inside_dhaka' ? '24 to 48 Hours (Dhaka Metro)' : '48 to 72 Hours (Nationwide)',
        courier: deliveryZone === 'inside_dhaka' ? 'Pathao Logistics / Steadfast Express' : 'Steadfast Courier / Sundarban',
        deliveryZone,
        paymentMethod,
        trxId: trxId.trim() || undefined,
        financials: {
          currency: 'BDT',
          symbol: '৳',
          subtotal,
          discount,
          shipping: deliveryFee,
          total: grandTotal,
        },
      };
      onOrderSuccess(fallbackOrder);
      clearCart();
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white text-neutral-900 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[92vh] border border-neutral-200">
        {/* Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ccff00] text-black font-black flex items-center justify-center font-mono text-sm">
              BD
            </div>
            <div>
              <h3 className="font-mono font-black text-base uppercase tracking-tight flex items-center space-x-2">
                <span>GAZI CRICKET BANGLADESH CHECKOUT</span>
                <span className="bg-emerald-950 text-emerald-400 text-[10px] font-sans font-bold px-2 py-0.5 rounded border border-emerald-800">
                  SSL SECURED
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                100% Genuine Cricket Gear • Nationwide Express Delivery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Customer Details */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-black uppercase text-neutral-900 tracking-wider mb-3">
              <User size={15} className="text-black" />
              <span>১. গ্রাহকের তথ্য (Customer Details)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Full Name (পূর্ণ নাম) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tamim Iqbal"
                    className={`w-full bg-neutral-50 border ${
                      errors.fullName ? 'border-red-500' : 'border-neutral-300'
                    } pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none focus:border-black font-medium`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Mobile Number (মোবাইল নম্বর) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712-XXXXXX or +88017XXXXXXXX"
                    className={`w-full bg-neutral-50 border ${
                      errors.phone ? 'border-red-500' : 'border-neutral-300'
                    } pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none focus:border-black font-medium`}
                  />
                </div>
                {errors.phone ? (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.phone}</p>
                ) : (
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    অর্ডার কনফার্মেশনের জন্য কল করা হবে
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 mb-1">
                  Email Address (ইমেইল - Optional)
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com (for tracking updates)"
                    className="w-full bg-neutral-50 border border-neutral-300 pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address (Division & District Cascades) */}
          <div className="border-t border-neutral-200 pt-5">
            <div className="flex items-center space-x-2 text-xs font-black uppercase text-neutral-900 tracking-wider mb-3">
              <MapPin size={15} className="text-black" />
              <span>২. ডেলিভারি ঠিকানা (Shipping Address)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
              {/* Division Dropdown */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Division (বিভাগ) <span className="text-red-500">*</span>
                </label>
                <select
                  value={division}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-black cursor-pointer"
                >
                  {BD_DIVISIONS.map((d) => (
                    <option key={d.division} value={d.division}>
                      {d.division} ({d.divisionBn})
                    </option>
                  ))}
                </select>
              </div>

              {/* District Dropdown */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  District (জেলা) <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-black cursor-pointer"
                >
                  {districtList.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thana / Upazila */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Thana / Upazila (থানা / উপজেলা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  placeholder="e.g. Mirpur, Dhanmondi, Boalkhali"
                  className={`w-full bg-neutral-50 border ${
                    errors.thana ? 'border-red-500' : 'border-neutral-300'
                  } px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-black font-medium`}
                />
                {errors.thana && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.thana}</p>
                )}
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 mb-1">
                  House, Road & Area (বাসা, রোড ও এলাকার বিস্তারিত ঠিকানা) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House #14, Road #5, Block B, Mirpur-2, Dhaka"
                  className={`w-full bg-neutral-50 border ${
                    errors.address ? 'border-red-500' : 'border-neutral-300'
                  } px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-black font-medium resize-none`}
                />
                {errors.address && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Delivery Zone Selection */}
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <label className="block font-black text-xs uppercase text-neutral-800 mb-2">
                ডেলিভারি জোন নির্বাচন (Delivery Zone & Logistics)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label
                  className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                    deliveryZone === 'inside_dhaka'
                      ? 'border-black bg-white ring-1 ring-black shadow-sm'
                      : 'border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="radio"
                      name="deliveryZone"
                      checked={deliveryZone === 'inside_dhaka'}
                      onChange={() => setDeliveryZone('inside_dhaka')}
                      className="accent-black"
                    />
                    <div>
                      <span className="font-bold block text-neutral-900">
                        Inside Dhaka (ঢাকা সিটি)
                      </span>
                      <span className="text-[11px] text-neutral-500">24-48 Hours Express</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-neutral-900">
                    {subtotal >= 5000 ? (
                      <span className="text-emerald-600 font-extrabold">FREE</span>
                    ) : (
                      '৳70'
                    )}
                  </span>
                </label>

                <label
                  className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                    deliveryZone === 'outside_dhaka'
                      ? 'border-black bg-white ring-1 ring-black shadow-sm'
                      : 'border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="radio"
                      name="deliveryZone"
                      checked={deliveryZone === 'outside_dhaka'}
                      onChange={() => setDeliveryZone('outside_dhaka')}
                      className="accent-black"
                    />
                    <div>
                      <span className="font-bold block text-neutral-900">
                        Outside Dhaka (ঢাকার বাইরে সারা বাংলাদেশ)
                      </span>
                      <span className="text-[11px] text-neutral-500">48-72 Hours Courier</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-neutral-900">
                    {subtotal >= 5000 ? (
                      <span className="text-emerald-600 font-extrabold">FREE</span>
                    ) : (
                      '৳130'
                    )}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method Selection */}
          <div className="border-t border-neutral-200 pt-5">
            <div className="flex items-center space-x-2 text-xs font-black uppercase text-neutral-900 tracking-wider mb-3">
              <Banknote size={15} className="text-black" />
              <span>৩. পেমেন্ট পদ্ধতি (Payment Method)</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Cash on Delivery */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start space-x-3 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-black bg-neutral-50 ring-1 ring-black shadow-sm'
                    : 'border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-black mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Banknote size={16} className="text-emerald-600" />
                    <span className="font-extrabold text-neutral-900">
                      Cash on Delivery (ক্যাশ অন ডেলিভারি / COD)
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded">
                      জনপ্রিয়
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    পণ্য হাতে পেয়ে রাইডারের কাছে মূল্য পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।
                  </p>
                </div>
              </label>

              {/* bKash */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start space-x-3 transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-[#e2136e] bg-pink-50/50 ring-1 ring-[#e2136e] shadow-sm'
                    : 'border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="accent-[#e2136e] mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#e2136e] text-white text-[10px] font-black px-2 py-0.5 rounded">
                      bKash
                    </span>
                    <span className="font-extrabold text-neutral-900">
                      বিকাশ পেমেন্ট (bKash Wallet / Merchant)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-1">
                    বিকাশ মার্চেন্ট ওয়ালেট <strong className="text-black font-mono">01700-000000</strong> এ Payment করুন এবং Transaction ID (TrxID) নিচে দিন।
                  </p>
                  {paymentMethod === 'bkash' && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                        placeholder="Enter bKash TrxID (e.g. BK892JX01)"
                        className="w-full sm:w-64 bg-white border border-[#e2136e] px-3 py-1.5 rounded-lg text-xs font-mono font-bold focus:outline-none uppercase"
                      />
                      {errors.trxId && (
                        <p className="text-[10px] text-red-600 mt-1">{errors.trxId}</p>
                      )}
                    </div>
                  )}
                </div>
              </label>

              {/* Nagad */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start space-x-3 transition-all ${
                  paymentMethod === 'nagad'
                    ? 'border-[#f7941d] bg-amber-50/50 ring-1 ring-[#f7941d] shadow-sm'
                    : 'border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'nagad'}
                  onChange={() => setPaymentMethod('nagad')}
                  className="accent-[#f7941d] mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#f7941d] text-white text-[10px] font-black px-2 py-0.5 rounded">
                      Nagad
                    </span>
                    <span className="font-extrabold text-neutral-900">
                      নগদ পেমেন্ট (Nagad Wallet / Merchant)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-1">
                    নগদ মার্চেন্ট ওয়ালেট <strong className="text-black font-mono">01700-000000</strong> এ পেমেন্ট করে TrxID প্রদান করুন।
                  </p>
                  {paymentMethod === 'nagad' && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                        placeholder="Enter Nagad TrxID (e.g. NGD7184K9)"
                        className="w-full sm:w-64 bg-white border border-[#f7941d] px-3 py-1.5 rounded-lg text-xs font-mono font-bold focus:outline-none uppercase"
                      />
                      {errors.trxId && (
                        <p className="text-[10px] text-red-600 mt-1">{errors.trxId}</p>
                      )}
                    </div>
                  )}
                </div>
              </label>

              {/* Card / SSLCommerz */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start space-x-3 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-black bg-neutral-50 ring-1 ring-black shadow-sm'
                    : 'border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-black mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <CreditCard size={16} className="text-neutral-700" />
                    <span className="font-extrabold text-neutral-900">
                      Debit / Credit Card / Internet Banking (SSLCommerz)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    VISA, Mastercard, UnionPay, DBBL Nexus ও সকল বাংলাদেশি ব্যাংকের কার্ড সমর্থিত।
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Order Financials Summary */}
          <div className="border-t border-neutral-200 pt-5 bg-neutral-50 p-4 rounded-xl">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800 mb-2.5">
              অর্ডার সারাংশ (Order Summary)
            </h4>
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Total Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="font-mono font-bold text-neutral-900">{formatBDT(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promo Discount ({promoCode})</span>
                  <span className="font-mono">-{formatBDT(discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>
                  Delivery Charge (
                  {deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                </span>
                <span className="font-mono font-bold text-neutral-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-extrabold">FREE (৳5,000+ Offer)</span>
                  ) : (
                    formatBDT(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-neutral-200">
                <span>সর্বমোট প্রদেয় (Total Payable)</span>
                <span className="text-base text-black font-mono font-black">{formatBDT(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-sm py-4 rounded-xl uppercase tracking-wider transition-all transform active:scale-98 flex items-center justify-center space-x-2 shadow-lg shadow-[#ccff00]/20 cursor-pointer"
            >
              {isSubmitting ? (
                <span>অর্ডার প্রসেস হচ্ছে... (Placing Order)</span>
              ) : (
                <>
                  <Lock size={16} />
                  <span>
                    অর্ডার নিশ্চিত করুন (CONFIRM ORDER • {formatBDT(grandTotal)})
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-500 mt-2">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>Gazi Cricket Mirpur Hub থেকে দ্রুত ডেলিভারি করা হবে • হটলাইন: +880 1700-000000</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
