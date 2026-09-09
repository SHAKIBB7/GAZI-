import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CricketProduct } from "../data/cricket-products";

export interface CartItem {
  id: string;
  product: CricketProduct;
  selectedSize?: string;
  selectedWeight?: string;
  quantity: number;
  addKnockingService: boolean;
  knockingServiceFee: number; // ৳1500 per bat
}

interface CartStore {
  items: CartItem[];
  couponCode: string | null;
  discountPercentage: number;
  discountAmount: number;
  shippingDivision: string; // "Dhaka" or "Outside Dhaka"
  shippingFee: number;

  addItem: (product: CricketProduct, size?: string, weight?: string, addKnocking?: boolean) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  toggleKnockingService: (itemId: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  setShippingDivision: (division: string) => void;
  clearCart: () => void;

  getSubtotal: () => number;
  getKnockingTotal: () => number;
  getTotalItems: () => number;
  getGrandTotal: () => number;
}

export const KNOCKING_SERVICE_PRICE = 1500; // ৳1,500 for 15,000 strikes + oiling + scuff sheet

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discountPercentage: 0,
      discountAmount: 0,
      shippingDivision: "Dhaka",
      shippingFee: 80, // Default inside Dhaka

      addItem: (product, size = "Short Handle (SH)", weight = "2lb 10oz", addKnocking = false) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedSize === size &&
              item.selectedWeight === weight
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += 1;
            return { items: updatedItems };
          }

          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            selectedSize: size,
            selectedWeight: weight,
            quantity: 1,
            addKnockingService: addKnocking && Boolean(product.hasKnockingOption),
            knockingServiceFee: addKnocking && Boolean(product.hasKnockingOption) ? KNOCKING_SERVICE_PRICE : 0,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      toggleKnockingService: (itemId) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === itemId && item.product.hasKnockingOption) {
              const newState = !item.addKnockingService;
              return {
                ...item,
                addKnockingService: newState,
                knockingServiceFee: newState ? KNOCKING_SERVICE_PRICE : 0,
              };
            }
            return item;
          }),
        }));
      },

      applyCoupon: (code) => {
        const cleanCode = code.trim().toUpperCase();
        if (cleanCode === "CRICKET10") {
          set({
            couponCode: cleanCode,
            discountPercentage: 10,
          });
          return { success: true, message: "10% Discount Applied Successfully!" };
        }
        if (cleanCode === "DHAKA500") {
          set({
            couponCode: cleanCode,
            discountAmount: 500,
            discountPercentage: 0,
          });
          return { success: true, message: "৳500 Flat Discount Applied!" };
        }
        return { success: false, message: "Invalid promo code. Try 'CRICKET10'" };
      },

      removeCoupon: () => {
        set({ couponCode: null, discountPercentage: 0, discountAmount: 0 });
      },

      setShippingDivision: (division) => {
        const fee = division.toLowerCase().includes("dhaka") ? 80 : 150;
        set({ shippingDivision: division, shippingFee: fee });
      },

      clearCart: () => {
        set({
          items: [],
          couponCode: null,
          discountPercentage: 0,
          discountAmount: 0,
        });
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.discountPrice || item.product.basePrice;
          return total + price * item.quantity;
        }, 0);
      },

      getKnockingTotal: () => {
        return get().items.reduce((total, item) => {
          return total + item.knockingServiceFee * item.quantity;
        }, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        const knocking = get().getKnockingTotal();
        const { discountPercentage, discountAmount, shippingFee } = get();

        let discount = discountAmount;
        if (discountPercentage > 0) {
          discount += (subtotal * discountPercentage) / 100;
        }

        const total = subtotal + knocking + shippingFee - discount;
        return Math.max(0, total);
      },
    }),
    {
      name: "cricket-store-cart",
    }
  )
);
