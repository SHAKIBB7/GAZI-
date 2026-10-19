import { Product } from '../types/cricket';

const API_BASE = '/api';

export interface PromoResult {
  valid: boolean;
  code: string;
  discountPercent: number;
  discountAmount: number;
  description: string;
}

export interface CheckoutResult {
  success: boolean;
  message: string;
  order: {
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
  ): Promise<CheckoutResult | null> {
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
      if (!res.ok) throw new Error('Checkout API error');
      return await res.json();
    } catch {
      return null;
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
