import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, CurrencyCode, DeliveryZone } from '../types/cricket';
import { CURRENCIES } from '../data/cricketData';
import { formatBDT, calculateDeliveryFee, FREE_SHIPPING_THRESHOLD_BDT } from '../utils/bangladesh';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  shipping: number;
  grandTotal: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  deliveryZone: DeliveryZone;
  setDeliveryZone: (zone: DeliveryZone) => void;
  promoCode: string;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  formatPrice: (amountInBdt: number) => string;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gazi_cricket_cart_bd');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>('BDT');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [promoCode, setPromoCode] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('gazi_cricket_cart_bd', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (product: Product, size?: string) => {
    const chosenSize = size || product.sizes[0] || 'Standard';
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedSize === chosenSize
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedSize === chosenSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, selectedSize: chosenSize, quantity: 1 }];
    });
    setToastMessage(`"${product.title}" (${chosenSize}) কার্টে যোগ করা হয়েছে!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.selectedSize === size))
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'CRICKET10' || clean === 'TIGERS10') {
      setPromoCode(clean);
      return true;
    }
    return false;
  };

  const removePromoCode = () => setPromoCode('');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discount = (promoCode === 'CRICKET10' || promoCode === 'TIGERS10') ? subtotal * 0.1 : 0;
  const shipping = calculateDeliveryFee(subtotal, deliveryZone);
  const grandTotal = Math.max(0, subtotal - discount + shipping);

  const freeShippingThreshold = FREE_SHIPPING_THRESHOLD_BDT;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD_BDT - subtotal);

  const formatPrice = (amountInBdt: number) => {
    if (currency === 'BDT') {
      return formatBDT(amountInBdt);
    }
    const config = CURRENCIES[currency] || CURRENCIES.BDT;
    const converted = amountInBdt * config.rate;
    return `${config.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        totalItems,
        subtotal,
        discount,
        shipping,
        grandTotal,
        freeShippingThreshold,
        freeShippingRemaining,
        deliveryZone,
        setDeliveryZone,
        promoCode,
        applyPromoCode,
        removePromoCode,
        currency,
        setCurrency,
        formatPrice,
        toastMessage,
        setToastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
