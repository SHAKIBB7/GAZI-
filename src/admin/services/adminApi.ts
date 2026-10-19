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

const API_BASE = '/api/admin';

function getToken(): string | null {
  return localStorage.getItem('gazi_admin_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
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

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { error: json.error || `Request failed with HTTP ${res.status}` };
    }

    return { data: json as T };
  } catch (err: any) {
    return { error: err.message || 'Network communication error' };
  }
}

export const adminApi = {
  // Auth
  async login(username: string, password: string) {
    return request<{ success: boolean; token: string; user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  async getMe() {
    return request<{ authenticated: boolean; user: AdminUser }>('/auth/me');
  },
  async logout() {
    return request<{ success: boolean }>('/auth/logout', { method: 'POST' });
  },

  // Products
  async getProducts(params: Record<string, any> = {}) {
    const qs = new URLSearchParams(params).toString();
    return request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      products: ProductAdmin[];
      summary: any;
    }>(`/products?${qs}`);
  },
  async getProduct(id: string) {
    return request<ProductAdmin>(`/products/${id}`);
  },
  async createProduct(product: Partial<ProductAdmin>) {
    return request<{ success: boolean; message: string; product: ProductAdmin }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },
  async updateProduct(id: string, product: Partial<ProductAdmin>) {
    return request<{ success: boolean; message: string; product: ProductAdmin }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },
  async archiveProduct(id: string) {
    return request<{ success: boolean; message: string; product: ProductAdmin }>(`/products/${id}/archive`, {
      method: 'PATCH',
    });
  },
  async importCsv(csvString: string) {
    return request<{ success: boolean; message: string; results: any }>('/products/import/csv', {
      method: 'POST',
      body: JSON.stringify({ csvString }),
    });
  },

  // Inventory
  async getInventoryLevels(params: Record<string, any> = {}) {
    const qs = new URLSearchParams(params).toString();
    return request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      items: InventoryItem[];
      summary: any;
      valuationMethod: string;
    }>(`/inventory/levels?${qs}`);
  },
  async getInventoryLedger(params: Record<string, any> = {}) {
    const qs = new URLSearchParams(params).toString();
    return request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      entries: LedgerEntry[];
    }>(`/inventory/ledger?${qs}`);
  },
  async adjustStock(productId: string, delta: number, reason: string, type: string = 'adjustment') {
    return request<{ success: boolean; message: string; product: ProductAdmin }>('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({ productId, delta, reason, type }),
    });
  },
  async reconcileStock(productId: string, physicalCount: number, reason: string) {
    return request<{ success: boolean; message: string; product: ProductAdmin }>('/inventory/reconcile', {
      method: 'POST',
      body: JSON.stringify({ productId, physicalCount, reason }),
    });
  },

  // Orders
  async getOrders(params: Record<string, any> = {}) {
    const qs = new URLSearchParams(params).toString();
    return request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      orders: OrderAdmin[];
      summary: any;
    }>(`/orders?${qs}`);
  },
  async getOrder(id: string) {
    return request<OrderAdmin>(`/orders/${id}`);
  },
  async updateOrderStatus(
    orderId: string,
    payload: { fulfillmentStatus: string; courier?: string; trackingNumber?: string; note?: string }
  ) {
    return request<{ success: boolean; message: string; order: OrderAdmin }>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  async updatePaymentStatus(
    orderId: string,
    payload: { paymentStatus: string; trxId?: string; paymentChannel?: string; note?: string }
  ) {
    return request<{ success: boolean; message: string; order: OrderAdmin }>(`/orders/${orderId}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  async cancelOrder(orderId: string, payload: { restock: boolean; reason?: string }) {
    return request<{ success: boolean; message: string; order: OrderAdmin }>(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async returnOrder(
    orderId: string,
    payload: { restock: boolean; itemsCondition: 'good' | 'damaged'; returnReason?: string }
  ) {
    return request<{ success: boolean; message: string; order: OrderAdmin }>(`/orders/${orderId}/return`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Suppliers & Purchases
  async getSuppliers() {
    return request<{ total: number; suppliers: Supplier[] }>('/procurement/suppliers');
  },
  async saveSupplier(supplier: Partial<Supplier>) {
    return request<{ success: boolean; message: string; supplier: Supplier }>('/procurement/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    });
  },
  async getPurchases(params: Record<string, any> = {}) {
    const qs = new URLSearchParams(params).toString();
    return request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      purchases: PurchaseOrder[];
      summary: any;
    }>(`/procurement/purchases?${qs}`);
  },
  async createPurchaseOrder(payload: any) {
    return request<{ success: boolean; message: string; purchaseOrder: PurchaseOrder }>('/procurement/purchases', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Expenses
  async getExpenses(params: Record<string, any> = {}) {
    const qs = new URLSearchParams(params).toString();
    return request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      expenses: Expense[];
      categories: Array<{ id: string; label: string }>;
      summary: any;
    }>(`/expenses?${qs}`);
  },
  async createExpense(payload: Partial<Expense>) {
    return request<{ success: boolean; message: string; expense: Expense }>('/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Reports
  async getFinancialReport(params: { period?: string; startDate?: string; endDate?: string } = {}) {
    const qs = new URLSearchParams(params as any).toString();
    return request<FinancialReport>(`/reports/financials?${qs}`);
  },

  // Audit Logs
  async getAuditLogs(params: Record<string, any> = {}) {
    const qs = new URLSearchParams(params).toString();
    return request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      logs: AuditLogEntry[];
    }>(`/audit-logs?${qs}`);
  },

  // Image Upload
  async uploadImages(files: FileList | File[]) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    return request<{ success: boolean; urls: string[]; primaryUrl: string }>('/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
