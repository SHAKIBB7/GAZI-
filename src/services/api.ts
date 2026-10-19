import { Product } from '../types/cricket';

const VITE_API_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
  : '';
const API_BASE = VITE_API_URL ? `${VITE_API_URL}/api` : '/api';

export interface PromoResult {
  valid: boolean;
  code: string;
  discountPercent: number;
  discountAmount: number;
  description: string;
}

export interface CheckoutResult {
  success: boolean;
  message?: string;
  error?: string;
  order?: {
    orderId: string;
    trackingNumber: string;
    date: string;
    status: string;
    estimatedDelivery: string;
    courier: string;
    deliveryZone?: string;
    paymentMethod?: string;
    trxId?: string;
    financials: {
      currency: string;
      symbol?: string;
      subtotal: number;
      discount: number;
      shipping: number;
      total: number;
    };
  };
}

export const apiService = {
  // 1. Health check
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // 2. Fetch products with query filters
  async getProducts(params?: Record<string, string | number | boolean>): Promise<{ total: number; products: Product[] } | null> {
    try {
      const query = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
      const res = await fetch(`${API_BASE}/products?${query}`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return null;
    }
  },

  // 3. Validate promo code via server
  async validatePromo(code: string, subtotal: number): Promise<PromoResult | null> {
    try {
      const res = await fetch(`${API_BASE}/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      // Local fallback
      if (code.trim().toUpperCase() === 'CRICKET10') {
        return {
          valid: true,
          code: 'CRICKET10',
          discountPercent: 10,
          discountAmount: subtotal * 0.1,
          description: '10% Off Your Entire Order',
        };
      }
      return null;
    }
  },

  // 4. Submit checkout with Bangladesh localization support
  async checkout(
    itemsOrPayload:
      | Array<{ productId: string; quantity: number; selectedSize: string; price: number }>
      | {
          items: Array<{ productId: string; quantity: number; selectedSize: string; price: number }>;
          promoCode?: string;
          customer?: {
            fullName: string;
            phone: string;
            email?: string;
            division: string;
            district: string;
            thana: string;
            address: string;
          };
          deliveryZone?: string;
          paymentMethod?: string;
          trxId?: string;
        },
    promoCodeParam?: string
  ): Promise<CheckoutResult> {
    try {
      let bodyData;
      if (Array.isArray(itemsOrPayload)) {
        bodyData = { items: itemsOrPayload, promoCode: promoCodeParam };
      } else {
        bodyData = itemsOrPayload;
      }

      const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          success: false,
          error: data.error || `Checkout failed with status ${res.status}. Please check your details and try again.`,
        };
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network communication error. Please check your internet connection.',
      };
    }
  },

  // 5. Subscribe newsletter
  async subscribeNewsletter(email: string) {
    try {
      const res = await fetch(`${API_BASE}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch {
      return { success: true, voucherCode: 'CRICKET10' };
    }
  },

  // 6. Track order
  async trackOrder(trackingNumber: string) {
    try {
      const res = await fetch(`${API_BASE}/orders/${trackingNumber}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};
