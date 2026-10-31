import {
  AdminUser,
  ProductAdmin,
  InventoryItem,
  LedgerEntry,
  OrderAdmin,
  Supplier,
  PurchaseOrder,
  Expense,
  FinancialReport,
  AuditLogEntry,
} from '../types';
import { localDb } from './localDatabase';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  isOffline?: boolean;
}

const VITE_API_URL =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
    : '';
const API_BASE = VITE_API_URL ? `${VITE_API_URL}/api/admin` : '/api/admin';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gazi_admin_token');
}

let isLiveServerHealthy: boolean | null = null;

export function getIsLiveServerConnected(): boolean {
  return isLiveServerHealthy === true;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!isJson) {
      isLiveServerHealthy = false;
      return {
        error: `Live backend API unreachable (received non-JSON content-type: ${contentType || 'text/html'}).`,
        isOffline: true,
      };
    }

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 404 || res.status >= 500) {
        isLiveServerHealthy = false;
        return { error: json.error || `HTTP ${res.status}`, isOffline: true };
      }
      return { error: json.error || `Request failed with HTTP ${res.status}` };
    }

    isLiveServerHealthy = true;
    return { data: json as T };
  } catch (err: any) {
    isLiveServerHealthy = false;
    return { error: err.message || 'Network communication error', isOffline: true };
  }
}

export const adminApi = {
  // 1. Auth
  async login(
    username: string,
    password: string
  ): Promise<ApiResponse<{ success: boolean; token: string; user: AdminUser }>> {
    const res = await request<{ success: boolean; token: string; user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (res.data?.success && res.data.token && res.data.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('gazi_admin_token', res.data.token);
        localStorage.setItem('gazi_admin_user', JSON.stringify(res.data.user));
      }
      return res;
    }

    // Fall back to local standalone database when live server is offline, unreachable, or returned non-JSON
    if (
      res.isOffline ||
      !isLiveServerHealthy ||
      (res.error && (res.error.includes('unreachable') || res.error.includes('Network') || res.error.includes('HTTP 404') || res.error.includes('HTTP 5')))
    ) {
      const localResult = localDb.login(username, password);
      if (localResult.success && localResult.token && localResult.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('gazi_admin_token', localResult.token);
          localStorage.setItem('gazi_admin_user', JSON.stringify(localResult.user));
        }
        return {
          data: {
            success: true,
            token: localResult.token,
            user: localResult.user,
          },
        };
      }
      return { error: localResult.error || 'Invalid credentials' };
    }

    return res;
  },

  async getMe(): Promise<ApiResponse<{ authenticated: boolean; user: AdminUser }>> {
    const res = await request<{ authenticated: boolean; user: AdminUser }>('/auth/me');
    if (res.data?.authenticated && res.data.user) {
      return res;
    }

    if (res.isOffline || !isLiveServerHealthy || !res.data) {
      const local = localDb.getMe();
      if (local.authenticated && local.user) {
        return { data: { authenticated: true, user: local.user } };
      }
    }

    return res;
  },

  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    try {
      await request<{ success: boolean }>('/auth/logout', { method: 'POST' });
    } catch {}
    localDb.logout();
    return { data: { success: true } };
  },

  // 2. Products
  async getProducts(
    params: Record<string, any> = {}
  ): Promise<
    ApiResponse<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      products: ProductAdmin[];
      summary: any;
    }>
  > {
    const qs = new URLSearchParams(params).toString();
    const res = await request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      products: ProductAdmin[];
      summary: any;
    }>(`/products?${qs}`);

    if (res.data) {
      if (typeof window !== 'undefined' && Array.isArray(res.data.products) && res.data.products.length > 0) {
        localStorage.setItem('gazi_local_products', JSON.stringify(res.data.products));
      }
      return res;
    }

    const local = localDb.getProducts(params);
    return { data: local };
  },

  async getProduct(id: string): Promise<ApiResponse<ProductAdmin>> {
    const res = await request<ProductAdmin>(`/products/${id}`);
    if (res.data) return res;
    const local = localDb.getProduct(id);
    return local ? { data: local } : { error: 'Product not found' };
  },

  async createProduct(
    product: Partial<ProductAdmin>
  ): Promise<ApiResponse<{ success: boolean; message: string; product: ProductAdmin }>> {
    const res = await request<{ success: boolean; message: string; product: ProductAdmin }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });

    if (res.data?.success) {
      try {
        localDb.createProduct(res.data.product);
      } catch {}
      return res;
    }

    try {
      const local = localDb.createProduct(product);
      return { data: local };
    } catch (err: any) {
      return { error: err.message || 'Failed to save product in database' };
    }
  },

  async updateProduct(
    id: string,
    product: Partial<ProductAdmin>
  ): Promise<ApiResponse<{ success: boolean; message: string; product: ProductAdmin }>> {
    const res = await request<{ success: boolean; message: string; product: ProductAdmin }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });

    if (res.data?.success) {
      try {
        localDb.updateProduct(id, product);
      } catch {}
      return res;
    }

    try {
      const local = localDb.updateProduct(id, product);
      return { data: local };
    } catch (err: any) {
      return { error: err.message || 'Failed to update product in database' };
    }
  },

  async archiveProduct(
    id: string
  ): Promise<ApiResponse<{ success: boolean; message: string; product: ProductAdmin }>> {
    const res = await request<{ success: boolean; message: string; product: ProductAdmin }>(
      `/products/${id}/archive`,
      { method: 'PATCH' }
    );

    if (res.data?.success) {
      try {
        localDb.archiveProduct(id);
      } catch {}
      return res;
    }

    try {
      const local = localDb.archiveProduct(id);
      return { data: local };
    } catch (err: any) {
      return { error: err.message || 'Failed to toggle archive status' };
    }
  },

  async importCsv(
    csvString: string
  ): Promise<ApiResponse<{ success: boolean; message: string; results: any }>> {
    const res = await request<{ success: boolean; message: string; results: any }>('/products/import/csv', {
      method: 'POST',
      body: JSON.stringify({ csvString }),
    });

    if (res.data) return res;

    try {
      const lines = csvString.split('\n').filter((l) => l.trim());
      let created = 0;
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 4) {
          localDb.createProduct({
            title: parts[0] || 'Imported Cricket Item',
            category: parts[1] || 'Cricket Bats',
            vendor: parts[2] || 'Gunn & Moore',
            price: parseFloat(parts[3]) || 12000,
            costPrice: parseFloat(parts[4]) || 8000,
            stock: parseInt(parts[5], 10) || 10,
          });
          created++;
        }
      }
      return { data: { success: true, message: `Imported ${created} products locally`, results: { created } } };
    } catch (e: any) {
      return { error: e.message || 'CSV import parsing error' };
    }
  },

  // 3. Inventory
  async getInventoryLevels(
    params: Record<string, any> = {}
  ): Promise<
    ApiResponse<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      items: InventoryItem[];
      summary: any;
      valuationMethod: string;
    }>
  > {
    const qs = new URLSearchParams(params).toString();
    const res = await request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      items: InventoryItem[];
      summary: any;
      valuationMethod: string;
    }>(`/inventory/levels?${qs}`);

    if (res.data) return res;
    return { data: localDb.getInventoryLevels(params) };
  },

  async getInventoryLedger(
    params: Record<string, any> = {}
  ): Promise<
    ApiResponse<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      entries: LedgerEntry[];
    }>
  > {
    const qs = new URLSearchParams(params).toString();
    const res = await request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      entries: LedgerEntry[];
    }>(`/inventory/ledger?${qs}`);

    if (res.data) return res;
    return { data: localDb.getInventoryLedger(params) };
  },

  async adjustStock(
    productId: string,
    delta: number,
    reason: string,
    type: string = 'adjustment'
  ): Promise<ApiResponse<{ success: boolean; message: string; product: ProductAdmin }>> {
    const res = await request<{ success: boolean; message: string; product: ProductAdmin }>('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({ productId, delta, reason, type }),
    });

    if (res.data) return res;
    try {
      const local = localDb.adjustStock(productId, delta, reason, type);
      return { data: local };
    } catch (err: any) {
      return { error: err.message || 'Failed to adjust stock' };
    }
  },

  async reconcileStock(
    productId: string,
    physicalCount: number,
    reason: string
  ): Promise<ApiResponse<{ success: boolean; message: string; product: ProductAdmin }>> {
    const res = await request<{ success: boolean; message: string; product: ProductAdmin }>('/inventory/reconcile', {
      method: 'POST',
      body: JSON.stringify({ productId, physicalCount, reason }),
    });

    if (res.data) return res;
    try {
      const local = localDb.reconcileStock(productId, physicalCount, reason);
      return { data: local };
    } catch (err: any) {
      return { error: err.message || 'Failed to reconcile stock' };
    }
  },

  // 4. Orders
  async getOrders(
    params: Record<string, any> = {}
  ): Promise<
    ApiResponse<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      orders: OrderAdmin[];
      summary: any;
    }>
  > {
    const qs = new URLSearchParams(params).toString();
    const res = await request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      orders: OrderAdmin[];
      summary: any;
    }>(`/orders?${qs}`);

    if (res.data) return res;
    return { data: localDb.getOrders(params) };
  },

  async getOrder(id: string): Promise<ApiResponse<OrderAdmin>> {
    const res = await request<OrderAdmin>(`/orders/${id}`);
    if (res.data) return res;
    const local = localDb.getOrder(id);
    return local ? { data: local } : { error: 'Order not found' };
  },

  async updateOrderStatus(
    orderId: string,
    payload: { fulfillmentStatus: string; courier?: string; trackingNumber?: string; note?: string }
  ): Promise<ApiResponse<{ success: boolean; message: string; order: OrderAdmin }>> {
    const res = await request<{ success: boolean; message: string; order: OrderAdmin }>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (res.data) return res;
    try {
      const local = localDb.updateOrderStatus(orderId, payload);
      return { data: local };
    } catch (err: any) {
      return { error: err.message || 'Failed to update order status' };
    }
  },

  async updatePaymentStatus(
    orderId: string,
    payload: { paymentStatus: string; trxId?: string; paymentChannel?: string; note?: string }
  ): Promise<ApiResponse<{ success: boolean; message: string; order: OrderAdmin }>> {
    const res = await request<{ success: boolean; message: string; order: OrderAdmin }>(`/orders/${orderId}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (res.data) return res;
    try {
      const local = localDb.updatePaymentStatus(orderId, payload);
      return { data: local };
    } catch (err: any) {
      return { error: err.message || 'Failed to update payment status' };
    }
  },

  async cancelOrder(
    orderId: string,
    payload: { restock: boolean; reason?: string }
  ): Promise<ApiResponse<{ success: boolean; message: string; order: OrderAdmin }>> {
    const res = await request<{ success: boolean; message: string; order: OrderAdmin }>(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data) return res;
    try {
      const local = localDb.cancelOrder(orderId, payload);
      return { data: local };
    } catch (err: any) {
      return { error: err.message || 'Failed to cancel order' };
    }
  },

  async returnOrder(
    orderId: string,
    payload: { restock: boolean; itemsCondition: 'good' | 'damaged'; returnReason?: string }
  ): Promise<ApiResponse<{ success: boolean; message: string; order: OrderAdmin }>> {
    const res = await request<{ success: boolean; message: string; order: OrderAdmin }>(`/orders/${orderId}/return`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data) return res;
    return { data: localDb.cancelOrder(orderId, { restock: payload.restock, reason: payload.returnReason }) };
  },

  // 5. Suppliers & Purchases
  async getSuppliers(): Promise<ApiResponse<{ total: number; suppliers: Supplier[] }>> {
    const res = await request<{ total: number; suppliers: Supplier[] }>('/procurement/suppliers');
    if (res.data) return res;
    return { data: localDb.getSuppliers() };
  },

  async saveSupplier(
    supplier: Partial<Supplier>
  ): Promise<ApiResponse<{ success: boolean; message: string; supplier: Supplier }>> {
    const res = await request<{ success: boolean; message: string; supplier: Supplier }>('/procurement/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    });

    if (res.data) return res;
    return { data: localDb.saveSupplier(supplier) };
  },

  async getPurchases(
    params: Record<string, any> = {}
  ): Promise<
    ApiResponse<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      purchases: PurchaseOrder[];
      summary: any;
    }>
  > {
    const qs = new URLSearchParams(params).toString();
    const res = await request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      purchases: PurchaseOrder[];
      summary: any;
    }>(`/procurement/purchases?${qs}`);

    if (res.data) return res;
    return { data: localDb.getPurchases(params) };
  },

  async createPurchaseOrder(
    payload: any
  ): Promise<ApiResponse<{ success: boolean; message: string; purchaseOrder: PurchaseOrder }>> {
    const res = await request<{ success: boolean; message: string; purchaseOrder: PurchaseOrder }>('/procurement/purchases', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data) return res;
    return { data: localDb.createPurchaseOrder(payload) };
  },

  // 6. Expenses
  async getExpenses(
    params: Record<string, any> = {}
  ): Promise<
    ApiResponse<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      expenses: Expense[];
      categories: Array<{ id: string; label: string }>;
      summary: any;
    }>
  > {
    const qs = new URLSearchParams(params).toString();
    const res = await request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      expenses: Expense[];
      categories: Array<{ id: string; label: string }>;
      summary: any;
    }>(`/expenses?${qs}`);

    if (res.data) return res;
    return { data: localDb.getExpenses(params) };
  },

  async createExpense(
    payload: Partial<Expense>
  ): Promise<ApiResponse<{ success: boolean; message: string; expense: Expense }>> {
    const res = await request<{ success: boolean; message: string; expense: Expense }>('/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data) return res;
    return { data: localDb.createExpense(payload) };
  },

  // 7. Reports
  async getFinancialReport(
    params: { period?: string; startDate?: string; endDate?: string } = {}
  ): Promise<ApiResponse<FinancialReport>> {
    const qs = new URLSearchParams(params as any).toString();
    const res = await request<FinancialReport>(`/reports/financials?${qs}`);
    if (res.data) return res;
    return { data: localDb.getFinancialReport() };
  },

  // 8. Audit Logs
  async getAuditLogs(
    params: Record<string, any> = {}
  ): Promise<
    ApiResponse<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      logs: AuditLogEntry[];
    }>
  > {
    const qs = new URLSearchParams(params).toString();
    const res = await request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      logs: AuditLogEntry[];
    }>(`/audit-logs?${qs}`);

    if (res.data) return res;
    return { data: localDb.getAuditLogs() };
  },

  // 9. Image Upload (with mobile camera & gallery base64 fallback)
  async uploadImages(
    files: FileList | File[]
  ): Promise<ApiResponse<{ success: boolean; urls: string[]; primaryUrl: string }>> {
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
      const res = await request<{ success: boolean; urls: string[]; primaryUrl: string }>('/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.data?.success && res.data.urls && res.data.urls.length > 0) {
        return res;
      }
    } catch {}

    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        urls.push(dataUrl);
      }
      return {
        data: {
          success: true,
          urls,
          primaryUrl: urls[0] || '',
        },
      };
    } catch (err: any) {
      return { error: err.message || 'Image processing failed' };
    }
  },
};
