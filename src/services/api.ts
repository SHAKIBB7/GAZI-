import { Product } from '../types/cricket';
import { PRODUCTS } from '../data/cricketData';
import { calculateDeliveryFee, normalizeBdPhone, isValidBdPhone } from '../utils/bangladesh';
import { localDb } from '../admin/services/localDatabase';
import { OrderAdmin } from '../admin/types';

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
  // 1. Health check with resilient standalone fallback
  async getHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE}/health`, { signal: controller.signal }).finally(() =>
        clearTimeout(timeoutId)
      );
      if (res.ok) {
        return await res.json();
      }
      return { status: 'ok', mode: 'resilient_standalone', currency: 'BDT' };
    } catch {
      return { status: 'ok', mode: 'resilient_standalone', currency: 'BDT' };
    }
  },

  // 2. Fetch products with query filters and static catalog fallback
  async getProducts(params?: Record<string, string | number | boolean>): Promise<{ total: number; products: Product[] } | null> {
    try {
      const query = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE}/products?${query}`, { signal: controller.signal }).finally(() =>
        clearTimeout(timeoutId)
      );
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      if (data && Array.isArray(data.products)) return data;
      return { total: PRODUCTS.length, products: PRODUCTS };
    } catch {
      return { total: PRODUCTS.length, products: PRODUCTS };
    }
  },

  // 3. Validate promo code via server or local rule engine
  async validatePromo(code: string, subtotal: number): Promise<PromoResult | null> {
    const clean = code.trim().toUpperCase();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE}/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean, subtotal }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (res.ok) {
        const data = await res.json();
        if (data && data.valid) return data;
      }
    } catch {
      // Server offline - evaluate with verified promotion rules
    }

    if (clean === 'CRICKET10' || clean === 'TIGERS10') {
      return {
        valid: true,
        code: clean,
        discountPercent: 10,
        discountAmount: Math.round(subtotal * 0.1),
        description: '10% Off Your Entire Order (Gazi Cricket Promo)',
      };
    }
    return null;
  },

  // 4. Submit checkout with Bangladesh localization & resilient fallback
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
    let bodyData: any;
    if (Array.isArray(itemsOrPayload)) {
      bodyData = { items: itemsOrPayload, promoCode: promoCodeParam };
    } else {
      bodyData = itemsOrPayload;
    }

    // Attempt remote backend API if configured/available
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data?.success && data?.order) {
          return data;
        }
        if (res.status === 400 && data?.error) {
          return { success: false, error: data.error };
        }
      }
    } catch {
      // Remote API call failed or timed out — seamlessly activate resilient local processor
    }

    // Resilient Local Order Processor
    try {
      const items = bodyData.items || [];
      if (!items.length) {
        return { success: false, error: 'Shopping bag is empty' };
      }

      const customer = bodyData.customer || {};
      if (customer.phone && !isValidBdPhone(customer.phone)) {
        return {
          success: false,
          error: 'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712-345678).',
        };
      }

      const deliveryZone = bodyData.deliveryZone || 'inside_dhaka';
      const paymentMethod = bodyData.paymentMethod || 'cod';
      const promoCode = bodyData.promoCode || '';
      const trxId = bodyData.trxId || '';

      // Calculate items & subtotal
      let subtotal = 0;
      let cogs = 0;
      const orderItems: any[] = [];

      for (const item of items) {
        const pid = item.productId || item.id;
        const prod = PRODUCTS.find((p) => p.id === pid) || {
          id: pid,
          title: item.title || item.name || 'Cricket Equipment',
          price: Number(item.price || 0),
          sku: `CRK-${pid}`,
          images: [],
        };
        const unitPrice = Number(item.price || prod.price || 0);
        const qty = Number(item.quantity || 1);
        const unitCost = Math.round(unitPrice * 0.65);

        subtotal += unitPrice * qty;
        cogs += unitCost * qty;

        orderItems.push({
          productId: prod.id,
          sku: (prod as any).sku || `CRK-${prod.id}`,
          title: prod.title,
          name: prod.title,
          selectedSize: item.selectedSize || 'Standard',
          quantity: qty,
          unitPrice,
          unitCost,
          totalPrice: unitPrice * qty,
          image: prod.images?.[0] || '',
        });
      }

      // Calculate promo discount
      let discount = 0;
      const cleanPromo = String(promoCode).trim().toUpperCase();
      if (cleanPromo === 'CRICKET10' || cleanPromo === 'TIGERS10') {
        discount = Math.round(subtotal * 0.1);
      }

      // Delivery fee
      const shipping = calculateDeliveryFee(subtotal - discount, deliveryZone);
      const total = Math.max(0, subtotal - discount + shipping);

      const now = new Date().toISOString();
      const orderId = `GZ-BD-${Date.now()}`;
      const trackingNumber = `GZ-TRK-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderRecord: OrderAdmin = {
        orderId,
        trackingNumber,
        date: now,
        status: 'pending',
        fulfillmentStatus: 'pending',
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : (trxId ? 'paid' : 'pending'),
        paymentDetails: trxId
          ? {
              trxId,
              paymentChannel: paymentMethod,
              settledAt: now,
            }
          : undefined,
        courier: deliveryZone === 'inside_dhaka' ? 'Steadfast Courier' : 'Pathao Courier',
        deliveryZone,
        estimatedDelivery: deliveryZone === 'inside_dhaka' ? '24–48 Hours' : '2–4 Business Days',
        customer: {
          fullName: customer.fullName || 'Valued Cricket Customer',
          phone: customer.phone ? normalizeBdPhone(customer.phone) : '01700000000',
          email: customer.email || '',
          division: customer.division || 'Dhaka',
          district: customer.district || 'Dhaka',
          thana: customer.thana || '',
          address: customer.address || 'Dhaka, Bangladesh',
        },
        items: orderItems,
        financials: {
          currency: 'BDT',
          subtotal,
          discount,
          shipping,
          total,
          cogs,
        },
        history: [
          {
            timestamp: now,
            actor: 'customer',
            action: 'ORDER_PLACED',
            note: 'Order placed via online storefront checkout',
          },
        ],
      };

      // Persist in local database so order appears in Admin Dashboard
      localDb.addCustomerOrder(orderRecord);

      return {
        success: true,
        message: 'Order placed successfully! Immediate dispatch queued.',
        order: {
          orderId,
          trackingNumber,
          date: now,
          status: 'pending',
          estimatedDelivery: orderRecord.estimatedDelivery,
          courier: orderRecord.courier,
          deliveryZone,
          paymentMethod,
          trxId: trxId || undefined,
          financials: {
            currency: 'BDT',
            symbol: '৳',
            subtotal,
            discount,
            shipping,
            total,
          },
        },
      };
    } catch (fallbackErr: any) {
      return {
        success: false,
        error: fallbackErr.message || 'Could not process order. Please check your details and try again.',
      };
    }
  },

  // 5. Subscribe newsletter
  async subscribeNewsletter(email: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
      if (res.ok) return await res.json();
      return { success: true, voucherCode: 'CRICKET10' };
    } catch {
      return { success: true, voucherCode: 'CRICKET10' };
    }
  },

  // 6. Track order via API or local database
  async trackOrder(trackingNumber: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE}/orders/${trackingNumber}`, {
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
      if (res.ok) return await res.json();
    } catch {
      // Local fallback
    }
    return localDb.getOrder(trackingNumber);
  },
};
