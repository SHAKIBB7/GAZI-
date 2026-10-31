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
import { PRODUCTS } from '../../data/cricketData';

const STORAGE_KEYS = {
  TOKEN: 'gazi_admin_token',
  USER: 'gazi_admin_user',
  PRODUCTS: 'gazi_local_products',
  ORDERS: 'gazi_local_orders',
  LEDGER: 'gazi_local_ledger',
  SUPPLIERS: 'gazi_local_suppliers',
  PURCHASES: 'gazi_local_purchases',
  EXPENSES: 'gazi_local_expenses',
  AUDIT_LOGS: 'gazi_local_audit_logs',
};

const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'adm-001',
    username: 'admin',
    email: 'admin@gazisports.com',
    name: 'Chief Cricket Administrator',
    role: 'super_admin',
    permissions: ['*'],
  },
  {
    id: 'adm-002',
    username: 'inventory',
    email: 'inventory@gazisports.com',
    name: 'Dhaka Warehouse Manager',
    role: 'inventory_manager',
    permissions: ['inventory:*', 'products:read', 'orders:read'],
  },
];

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write failed:', err);
  }
}

// Initial Seed Generators
export function initSeedProducts(): ProductAdmin[] {
  return PRODUCTS.map((p, idx) => {
    const category = p.category || 'Cricket Bats';
    const vendor = p.vendor || 'Gunn & Moore';
    const sku =
      (p as any).sku ||
      `CRK-${vendor.substring(0, 2).toUpperCase()}-${(1000 + idx).toString()}`;
    const costPrice = (p as any).costPrice || Math.round(p.price * 0.65);
    const stock = typeof p.stock === 'number' ? p.stock : 18;

    return {
      id: p.id,
      sku,
      title: p.title,
      vendor,
      category,
      department: p.department || category,
      handle: p.handle || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: p.price,
      costPrice,
      oldPrice: p.oldPrice || null,
      stock,
      lowStockThreshold: 4,
      status: 'active',
      sizes: p.sizes || ['Short Handle (Med)'],
      color: p.color || 'White/Black',
      images: p.images || [],
      description: p.description || 'Premium genuine cricket equipment.',
      franchise: p.franchise,
      isNew: p.isNew,
      isExclusive: p.isExclusive,
      rating: p.rating || 4.8,
      reviewsCount: p.reviewsCount || 12,
      specs: p.specs || {
        'Willow Grade': 'Selected Grade 1 English Willow',
        Weight: '2lb 9oz',
      },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };
  });
}

function initSeedOrders(): OrderAdmin[] {
  return [
    {
      orderId: 'GZ-BD-1792416678027',
      trackingNumber: 'GZ-TRK-910213',
      date: '2026-10-31T12:00:00.000Z',
      status: 'pending',
      fulfillmentStatus: 'pending',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      courier: 'Steadfast Courier',
      deliveryZone: 'inside_dhaka',
      estimatedDelivery: '24–48 Hours',
      customer: {
        fullName: 'Sakib Al Hasan',
        phone: '01711223344',
        division: 'Dhaka',
        district: 'Dhaka',
        thana: 'Mirpur',
        address: 'House 5, Road 2, Mirpur-2, Dhaka',
      },
      items: [
        {
          productId: '1055203',
          sku: 'CRK-SHOE-AD-22YDS',
          title: 'adidas 22YDS Training Bowling Cricket Shoe',
          selectedSize: '9',
          quantity: 1,
          unitPrice: 14400,
          unitCost: 9500,
          totalPrice: 14400,
          image: 'https://www.prodirectsport.com/cdn/shop/files/1055203_main.jpg?v=1792326199&width=800',
        },
      ],
      financials: {
        currency: 'BDT',
        subtotal: 14400,
        discount: 1440,
        shipping: 0,
        total: 12960,
        cogs: 9500,
      },
      history: [
        {
          timestamp: '2026-10-31T12:00:00.000Z',
          actor: 'customer',
          action: 'ORDER_PLACED',
          note: 'Customer ordered via mobile checkout',
        },
      ],
    },
    {
      orderId: 'GZ-BD-1792416689001',
      trackingNumber: 'GZ-TRK-882104',
      date: '2026-10-30T15:30:00.000Z',
      status: 'shipped',
      fulfillmentStatus: 'shipped',
      paymentMethod: 'bkash',
      paymentStatus: 'paid',
      courier: 'Pathao Logistics',
      deliveryZone: 'outside_dhaka',
      estimatedDelivery: '48–72 Hours',
      customer: {
        fullName: 'Tamim Iqbal',
        phone: '01819234567',
        division: 'Chattogram',
        district: 'Chattogram',
        thana: 'Kotwali',
        address: 'GEC Circle, Chattogram',
      },
      items: [
        {
          productId: '1044439',
          sku: 'CRK-BAT-GM-55',
          title: 'Gunn & Moore Diamond Ben Stokes 55 English Willow Cricket Bat',
          selectedSize: 'Short Handle',
          quantity: 1,
          unitPrice: 28000,
          unitCost: 18000,
          totalPrice: 28000,
        },
      ],
      financials: {
        currency: 'BDT',
        subtotal: 28000,
        discount: 2800,
        shipping: 0,
        total: 25200,
        cogs: 18000,
      },
      history: [
        {
          timestamp: '2026-10-30T15:30:00.000Z',
          actor: 'system',
          action: 'ORDER_CONFIRMED',
          note: 'bKash online payment confirmed',
        },
      ],
    },
  ];
}

function initSeedSuppliers(): Supplier[] {
  return [
    {
      id: 'sup-9042',
      name: 'Sialkot Master Cricket Equipment Ltd',
      contactPerson: 'Zahid Mahmood',
      phone: '+923001234567',
      email: 'sales@sialkotmasterbats.com',
      address: 'Kashmir Road, Sialkot, Pakistan',
      categoriesSupplied: ['Cricket Bats', 'Batting Equipment'],
      totalPurchases: 250000,
      balanceOwed: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'sup-9043',
      name: 'Meerut Sports Hub India',
      contactPerson: 'Rajiv Sharma',
      phone: '+919812345678',
      email: 'rajiv@meerutsportshub.in',
      address: 'Sports Goods Complex, Meerut, UP, India',
      categoriesSupplied: ['Cricket Balls', 'Protection', 'Helmets'],
      totalPurchases: 180000,
      balanceOwed: 0,
      createdAt: '2026-01-15T00:00:00.000Z',
    },
  ];
}

function initSeedExpenses(): Expense[] {
  return [
    {
      id: 'exp-001',
      category: 'logistics',
      description: 'Steadfast & Pathao Courier Remittance (Dhaka Hub)',
      amount: 4500,
      date: '2026-10-31T09:00:00.000Z',
      paymentMethod: 'bKash',
      recordedBy: 'admin',
      createdAt: '2026-10-31T09:00:00.000Z',
    },
    {
      id: 'exp-002',
      category: 'hub_rent',
      description: 'Narsingdi Stadium Flagship Store Facility Lease',
      amount: 15000,
      date: '2026-10-01T00:00:00.000Z',
      paymentMethod: 'bank_transfer',
      recordedBy: 'admin',
      createdAt: '2026-10-01T00:00:00.000Z',
    },
  ];
}

export function recordLocalAuditLog(
  actor: string,
  role: string,
  action: string,
  entity: string,
  entityId: string,
  details: Record<string, any>
): void {
  const logs = getStorage<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    actor,
    role,
    action,
    entity,
    entityId,
    details,
    ip: '127.0.0.1 (Local Client)',
    timestamp: new Date().toISOString(),
  });
  if (logs.length > 200) logs.pop();
  setStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
}

// -------------------------------------------------------------
// LOCAL DATABASE API CONTROLLERS
// -------------------------------------------------------------
export const localDb = {
  // 1. Auth Login
  login(username: string, password: string): { success: boolean; token?: string; user?: AdminUser; error?: string } {
    const cleanUser = (username || '').toLowerCase().trim();
    const cleanPass = (password || '').trim();

    const matched = DEFAULT_ADMINS.find(
      (a) => a.username.toLowerCase() === cleanUser || a.email.toLowerCase() === cleanUser
    );

    if (matched && cleanPass === 'AdminPassword2026!') {
      const token = `gazi_local_token_${Date.now()}`;
      setStorage(STORAGE_KEYS.TOKEN, token);
      setStorage(STORAGE_KEYS.USER, matched);
      recordLocalAuditLog(matched.username, matched.role, 'LOGIN_SUCCESS', 'auth', matched.id, {
        source: 'Mobile Local Database Engine',
      });
      return { success: true, token, user: matched };
    }

    recordLocalAuditLog(username, 'anonymous', 'LOGIN_FAILED', 'auth', username, {
      reason: 'Invalid local credentials',
    });
    return { success: false, error: 'Invalid username/email or password' };
  },

  getMe(): { authenticated: boolean; user: AdminUser | null } {
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.TOKEN) : null;
    const user = getStorage<AdminUser | null>(STORAGE_KEYS.USER, null);
    if (token && user) {
      return { authenticated: true, user };
    }
    return { authenticated: false, user: null };
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  // 2. Products
  getProducts(params: Record<string, any> = {}): {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    products: ProductAdmin[];
    summary: any;
  } {
    let list = getStorage<ProductAdmin[]>(STORAGE_KEYS.PRODUCTS, []);
    if (!list || list.length === 0) {
      list = initSeedProducts();
      setStorage(STORAGE_KEYS.PRODUCTS, list);
    }

    const {
      page = 1,
      limit = 12,
      search = '',
      category = 'All',
      vendor = 'All',
      stockFilter = 'all',
      status = 'all',
    } = params;

    let filtered = [...list];

    if (status && status !== 'all') {
      filtered = filtered.filter((p) => (p.status || 'active') === status);
    } else {
      filtered = filtered.filter((p) => p.status !== 'archived');
    }

    if (category && category !== 'All') {
      filtered = filtered.filter((p) => (p.category || '').toLowerCase() === category.toLowerCase());
    }

    if (vendor && vendor !== 'All') {
      filtered = filtered.filter((p) => (p.vendor || '').toLowerCase() === vendor.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q) ||
          (p.vendor || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q)
      );
    }

    if (stockFilter === 'in_stock') {
      filtered = filtered.filter((p) => (p.stock || 0) > 5);
    } else if (stockFilter === 'low_stock') {
      filtered = filtered.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.lowStockThreshold || 4));
    } else if (stockFilter === 'out_of_stock') {
      filtered = filtered.filter((p) => (p.stock || 0) <= 0);
    }

    const total = filtered.length;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 12);
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    const totalInventoryValue = list.reduce((sum, p) => sum + (p.costPrice || 0) * (p.stock || 0), 0);
    const activeProductsCount = list.filter((p) => p.status === 'active').length;
    const lowStockCount = list.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.lowStockThreshold || 4)).length;

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      products: paginated,
      summary: {
        totalInventoryValue,
        activeProductsCount,
        lowStockCount,
      },
    };
  },

  getProduct(id: string): ProductAdmin | null {
    const list = getStorage<ProductAdmin[]>(STORAGE_KEYS.PRODUCTS, []);
    return list.find((p) => p.id === id) || null;
  },

  createProduct(payload: Partial<ProductAdmin>): { success: boolean; message: string; product: ProductAdmin } {
    let list = getStorage<ProductAdmin[]>(STORAGE_KEYS.PRODUCTS, []);
    if (!list || list.length === 0) list = initSeedProducts();

    const id = payload.id || `crk_${Date.now()}`;
    const sku =
      (payload.sku || '').trim().toUpperCase() ||
      `CRK-${(payload.vendor || 'GEN').substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newProduct: ProductAdmin = {
      id,
      sku,
      title: payload.title || 'Cricket Equipment Item',
      vendor: payload.vendor || 'Gunn & Moore',
      category: payload.category || 'Cricket Bats',
      department: payload.department || payload.category || 'Cricket Bats',
      handle: (payload.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: Number(payload.price) || 15000,
      costPrice: Number(payload.costPrice) || 10000,
      oldPrice: payload.oldPrice ? Number(payload.oldPrice) : null,
      stock: Number(payload.stock) || 10,
      lowStockThreshold: Number(payload.lowStockThreshold) || 4,
      status: payload.status || 'active',
      sizes: payload.sizes && payload.sizes.length > 0 ? payload.sizes : ['Standard'],
      color: payload.color || 'White/Black',
      images:
        payload.images && payload.images.length > 0
          ? payload.images
          : ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'],
      description: payload.description || 'Authentic cricket equipment item.',
      franchise: payload.franchise,
      isNew: Boolean(payload.isNew),
      isExclusive: Boolean(payload.isExclusive),
      rating: 5.0,
      reviewsCount: 1,
      specs: payload.specs || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newProduct);
    setStorage(STORAGE_KEYS.PRODUCTS, list);

    const ledger = getStorage<LedgerEntry[]>(STORAGE_KEYS.LEDGER, []);
    ledger.unshift({
      movementId: `mov-${Date.now()}`,
      productId: newProduct.id,
      sku: newProduct.sku,
      productTitle: newProduct.title,
      type: 'initial',
      quantityDelta: newProduct.stock,
      unitCost: newProduct.costPrice,
      totalCost: newProduct.costPrice * newProduct.stock,
      balanceAfter: newProduct.stock,
      referenceType: 'initial_stock',
      referenceId: newProduct.id,
      reason: 'Manual product creation from Admin Console',
      actor: 'admin',
      timestamp: new Date().toISOString(),
    });
    setStorage(STORAGE_KEYS.LEDGER, ledger);

    recordLocalAuditLog('admin', 'super_admin', 'PRODUCT_CREATE', 'product', newProduct.id, {
      title: newProduct.title,
      sku: newProduct.sku,
      price: newProduct.price,
    });

    return {
      success: true,
      message: 'Product created successfully and saved locally in database',
      product: newProduct,
    };
  },

  updateProduct(id: string, payload: Partial<ProductAdmin>): { success: boolean; message: string; product: ProductAdmin } {
    let list = getStorage<ProductAdmin[]>(STORAGE_KEYS.PRODUCTS, []);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error('Product not found in local database');
    }

    const updated = {
      ...list[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    setStorage(STORAGE_KEYS.PRODUCTS, list);

    recordLocalAuditLog('admin', 'super_admin', 'PRODUCT_UPDATE', 'product', id, {
      title: updated.title,
      changes: Object.keys(payload),
    });

    return { success: true, message: 'Product updated successfully in local database', product: updated };
  },

  archiveProduct(id: string): { success: boolean; message: string; product: ProductAdmin } {
    let list = getStorage<ProductAdmin[]>(STORAGE_KEYS.PRODUCTS, []);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');

    const nextStatus = list[idx].status === 'archived' ? 'active' : 'archived';
    list[idx].status = nextStatus;
    list[idx].updatedAt = new Date().toISOString();
    setStorage(STORAGE_KEYS.PRODUCTS, list);

    recordLocalAuditLog('admin', 'super_admin', 'PRODUCT_ARCHIVE_TOGGLE', 'product', id, {
      status: nextStatus,
    });

    return { success: true, message: `Product status updated to ${nextStatus}`, product: list[idx] };
  },

  // 3. Inventory
  getInventoryLevels(params: Record<string, any> = {}): {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    items: InventoryItem[];
    summary: any;
    valuationMethod: string;
  } {
    const { products, total, page, limit, totalPages, summary } = this.getProducts(params);
    const items: InventoryItem[] = products.map((p) => ({
      ...p,
      costValuation: (p.costPrice || 0) * (p.stock || 0),
      retailValuation: (p.price || 0) * (p.stock || 0),
      isLowStock: (p.stock || 0) > 0 && (p.stock || 0) <= (p.lowStockThreshold || 4),
      isOutOfStock: (p.stock || 0) <= 0,
    }));

    return {
      total,
      page,
      limit,
      totalPages,
      items,
      summary,
      valuationMethod: 'Weighted Average Cost (WAC) / Moving Average BDT',
    };
  },

  getInventoryLedger(params: Record<string, any> = {}): {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    entries: LedgerEntry[];
  } {
    let ledger = getStorage<LedgerEntry[]>(STORAGE_KEYS.LEDGER, []);
    if (!ledger || ledger.length === 0) {
      const products = getStorage<ProductAdmin[]>(STORAGE_KEYS.PRODUCTS, initSeedProducts());
      ledger = products.slice(0, 10).map((p) => ({
        movementId: `mov-init-${p.id}`,
        productId: p.id,
        sku: p.sku,
        productTitle: p.title,
        type: 'initial',
        quantityDelta: p.stock,
        unitCost: p.costPrice,
        totalCost: p.costPrice * p.stock,
        balanceAfter: p.stock,
        referenceType: 'initial_stock',
        referenceId: p.id,
        reason: 'Central Warehouse Stock Intake',
        actor: 'admin',
        timestamp: '2026-01-01T00:00:00.000Z',
      }));
      setStorage(STORAGE_KEYS.LEDGER, ledger);
    }

    const { page = 1, limit = 20 } = params;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 20);
    const totalPages = Math.ceil(ledger.length / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;

    return {
      total: ledger.length,
      page: pageNum,
      limit: limitNum,
      totalPages,
      entries: ledger.slice(startIndex, startIndex + limitNum),
    };
  },

  adjustStock(
    productId: string,
    delta: number,
    reason: string,
    type: string = 'adjustment'
  ): { success: boolean; message: string; product: ProductAdmin } {
    const list = getStorage<ProductAdmin[]>(STORAGE_KEYS.PRODUCTS, []);
    const idx = list.findIndex((p) => p.id === productId);
    if (idx === -1) throw new Error('Product not found');

    const newStock = Math.max(0, (list[idx].stock || 0) + delta);
    list[idx].stock = newStock;
    list[idx].updatedAt = new Date().toISOString();
    setStorage(STORAGE_KEYS.PRODUCTS, list);

    const ledger = getStorage<LedgerEntry[]>(STORAGE_KEYS.LEDGER, []);
    ledger.unshift({
      movementId: `mov-${Date.now()}`,
      productId: list[idx].id,
      sku: list[idx].sku,
      productTitle: list[idx].title,
      type: (type as any) || 'adjustment',
      quantityDelta: delta,
      unitCost: list[idx].costPrice,
      totalCost: Math.abs(delta) * list[idx].costPrice,
      balanceAfter: newStock,
      referenceType: 'manual_adjustment',
      referenceId: `adj-${Date.now()}`,
      reason: reason || 'Manual stock adjustment from Admin Console',
      actor: 'admin',
      timestamp: new Date().toISOString(),
    });
    setStorage(STORAGE_KEYS.LEDGER, ledger);

    recordLocalAuditLog('admin', 'super_admin', 'STOCK_ADJUSTMENT', 'inventory', productId, {
      delta,
      newStock,
      reason,
    });

    return { success: true, message: 'Stock level updated successfully', product: list[idx] };
  },

  reconcileStock(
    productId: string,
    physicalCount: number,
    reason: string
  ): { success: boolean; message: string; product: ProductAdmin } {
    const list = getStorage<ProductAdmin[]>(STORAGE_KEYS.PRODUCTS, []);
    const idx = list.findIndex((p) => p.id === productId);
    if (idx === -1) throw new Error('Product not found');

    const prevStock = list[idx].stock || 0;
    const delta = physicalCount - prevStock;
    list[idx].stock = Math.max(0, physicalCount);
    list[idx].updatedAt = new Date().toISOString();
    setStorage(STORAGE_KEYS.PRODUCTS, list);

    const ledger = getStorage<LedgerEntry[]>(STORAGE_KEYS.LEDGER, []);
    ledger.unshift({
      movementId: `mov-${Date.now()}`,
      productId: list[idx].id,
      sku: list[idx].sku,
      productTitle: list[idx].title,
      type: 'reconciliation',
      quantityDelta: delta,
      unitCost: list[idx].costPrice,
      totalCost: Math.abs(delta) * list[idx].costPrice,
      balanceAfter: list[idx].stock,
      referenceType: 'physical_reconciliation',
      referenceId: `rec-${Date.now()}`,
      reason: reason || 'Physical stock audit reconciliation',
      actor: 'admin',
      timestamp: new Date().toISOString(),
    });
    setStorage(STORAGE_KEYS.LEDGER, ledger);

    return { success: true, message: 'Physical stock count reconciled', product: list[idx] };
  },

  // 4. Orders
  getOrders(params: Record<string, any> = {}): {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    orders: OrderAdmin[];
    summary: any;
  } {
    let orders = getStorage<OrderAdmin[]>(STORAGE_KEYS.ORDERS, []);
    if (!orders || orders.length === 0) {
      orders = initSeedOrders();
      setStorage(STORAGE_KEYS.ORDERS, orders);
    }

    const { page = 1, limit = 15, search = '', fulfillmentStatus = 'all', paymentStatus = 'all' } = params;

    let filtered = [...orders];

    if (fulfillmentStatus && fulfillmentStatus !== 'all') {
      filtered = filtered.filter((o) => o.fulfillmentStatus === fulfillmentStatus);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      filtered = filtered.filter((o) => o.paymentStatus === paymentStatus);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q)) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.phone.includes(q)
      );
    }

    const total = filtered.length;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 15);
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.financials?.total || 0), 0);
    const pendingOrdersCount = orders.filter((o) => o.fulfillmentStatus === 'pending').length;

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      orders: filtered.slice(startIndex, startIndex + limitNum),
      summary: {
        totalRevenue,
        pendingOrdersCount,
      },
    };
  },

  getOrder(id: string): OrderAdmin | null {
    const orders = getStorage<OrderAdmin[]>(STORAGE_KEYS.ORDERS, []);
    return orders.find((o) => o.orderId === id || o.trackingNumber === id) || null;
  },

  updateOrderStatus(
    orderId: string,
    payload: { fulfillmentStatus: string; courier?: string; trackingNumber?: string; note?: string }
  ): { success: boolean; message: string; order: OrderAdmin } {
    const orders = getStorage<OrderAdmin[]>(STORAGE_KEYS.ORDERS, []);
    const idx = orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) throw new Error('Order not found');

    orders[idx] = {
      ...orders[idx],
      fulfillmentStatus: payload.fulfillmentStatus as any,
      courier: payload.courier || orders[idx].courier,
      trackingNumber: payload.trackingNumber || orders[idx].trackingNumber,
    };
    setStorage(STORAGE_KEYS.ORDERS, orders);

    recordLocalAuditLog('admin', 'super_admin', 'ORDER_STATUS_UPDATE', 'order', orderId, payload);
    return { success: true, message: 'Order status updated', order: orders[idx] };
  },

  updatePaymentStatus(
    orderId: string,
    payload: { paymentStatus: string; trxId?: string; paymentChannel?: string; note?: string }
  ): { success: boolean; message: string; order: OrderAdmin } {
    const orders = getStorage<OrderAdmin[]>(STORAGE_KEYS.ORDERS, []);
    const idx = orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) throw new Error('Order not found');

    orders[idx] = {
      ...orders[idx],
      paymentStatus: payload.paymentStatus as any,
      paymentDetails: {
        ...orders[idx].paymentDetails,
        trxId: payload.trxId,
        paymentChannel: payload.paymentChannel,
        settledAt: new Date().toISOString(),
      },
    };
    setStorage(STORAGE_KEYS.ORDERS, orders);

    recordLocalAuditLog('admin', 'super_admin', 'PAYMENT_STATUS_UPDATE', 'order', orderId, payload);
    return { success: true, message: 'Payment status updated', order: orders[idx] };
  },

  cancelOrder(orderId: string, payload: { restock: boolean; reason?: string }): { success: boolean; message: string; order: OrderAdmin } {
    const orders = getStorage<OrderAdmin[]>(STORAGE_KEYS.ORDERS, []);
    const idx = orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) throw new Error('Order not found');

    orders[idx].fulfillmentStatus = 'cancelled';
    setStorage(STORAGE_KEYS.ORDERS, orders);

    if (payload.restock && orders[idx].items) {
      const products = getStorage<ProductAdmin[]>(STORAGE_KEYS.PRODUCTS, []);
      orders[idx].items.forEach((item) => {
        const pIdx = products.findIndex((p) => p.id === item.productId || p.sku === item.sku);
        if (pIdx !== -1) {
          products[pIdx].stock += item.quantity;
        }
      });
      setStorage(STORAGE_KEYS.PRODUCTS, products);
    }

    return { success: true, message: 'Order marked as cancelled', order: orders[idx] };
  },

  // 5. Suppliers & Procurement
  getSuppliers(): { total: number; suppliers: Supplier[] } {
    let suppliers = getStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    if (!suppliers || suppliers.length === 0) {
      suppliers = initSeedSuppliers();
      setStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
    }
    return { total: suppliers.length, suppliers };
  },

  saveSupplier(payload: Partial<Supplier>): { success: boolean; message: string; supplier: Supplier } {
    let suppliers = getStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    if (!suppliers || suppliers.length === 0) suppliers = initSeedSuppliers();

    const id = payload.id || `sup-${Date.now().toString().slice(-4)}`;
    const newSup: Supplier = {
      id,
      name: payload.name || 'Cricket Supplier',
      contactPerson: payload.contactPerson || '',
      phone: payload.phone || '',
      email: payload.email || '',
      address: payload.address || '',
      categoriesSupplied: payload.categoriesSupplied || ['Cricket Equipment'],
      totalPurchases: payload.totalPurchases || 0,
      balanceOwed: payload.balanceOwed || 0,
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
    };

    const existingIdx = suppliers.findIndex((s) => s.id === id);
    if (existingIdx !== -1) {
      suppliers[existingIdx] = { ...suppliers[existingIdx], ...newSup };
    } else {
      suppliers.unshift(newSup);
    }
    setStorage(STORAGE_KEYS.SUPPLIERS, suppliers);

    return { success: true, message: 'Supplier saved successfully', supplier: newSup };
  },

  getPurchases(params: Record<string, any> = {}): {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    purchases: PurchaseOrder[];
    summary: any;
  } {
    const purchases = getStorage<PurchaseOrder[]>(STORAGE_KEYS.PURCHASES, []);
    return {
      total: purchases.length,
      page: 1,
      limit: 15,
      totalPages: 1,
      purchases,
      summary: {},
    };
  },

  createPurchaseOrder(payload: any): { success: boolean; message: string; purchaseOrder: PurchaseOrder } {
    const purchases = getStorage<PurchaseOrder[]>(STORAGE_KEYS.PURCHASES, []);
    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      supplierId: payload.supplierId || 'sup-9042',
      supplierName: payload.supplierName || 'Sialkot Master Bats Ltd',
      status: 'ordered',
      date: new Date().toISOString(),
      items: payload.items || [],
      additionalCosts: payload.shipping || 0,
      totalAmount: payload.totalCost || 0,
      paymentStatus: 'unpaid',
      amountPaid: 0,
      balanceDue: payload.totalCost || 0,
      receivedBy: '',
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
    };
    purchases.unshift(po);
    setStorage(STORAGE_KEYS.PURCHASES, purchases);
    return { success: true, message: 'Purchase order created', purchaseOrder: po };
  },

  // 6. Expenses
  getExpenses(params: Record<string, any> = {}): {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    expenses: Expense[];
    categories: Array<{ id: string; label: string }>;
    summary: any;
  } {
    let expenses = getStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    if (!expenses || expenses.length === 0) {
      expenses = initSeedExpenses();
      setStorage(STORAGE_KEYS.EXPENSES, expenses);
    }

    const categories = [
      { id: 'hub_rent', label: 'Warehouse & Hub Lease' },
      { id: 'logistics', label: 'Delivery & Logistics' },
      { id: 'staff_payroll', label: 'Staff Payroll' },
      { id: 'marketing', label: 'Marketing & Digital Ads' },
      { id: 'utilities', label: 'Electricity & Internet' },
      { id: 'packaging', label: 'Packaging & Bubble Wrap' },
      { id: 'other', label: 'Miscellaneous' },
    ];

    const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return {
      total: expenses.length,
      page: 1,
      limit: 20,
      totalPages: 1,
      expenses,
      categories,
      summary: { totalExpense },
    };
  },

  createExpense(payload: Partial<Expense>): { success: boolean; message: string; expense: Expense } {
    const expenses = getStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      category: payload.category || 'other',
      description: payload.description || 'Operating Expense',
      amount: Number(payload.amount) || 0,
      date: payload.date || new Date().toISOString(),
      paymentMethod: payload.paymentMethod || 'cash',
      recordedBy: payload.recordedBy || 'admin',
      receiptRef: payload.receiptRef || '',
      createdAt: new Date().toISOString(),
    };
    expenses.unshift(newExp);
    setStorage(STORAGE_KEYS.EXPENSES, expenses);
    return { success: true, message: 'Operating expense recorded', expense: newExp };
  },

  // 7. Financial Reports
  getFinancialReport(): FinancialReport {
    const orders = getStorage<OrderAdmin[]>(STORAGE_KEYS.ORDERS, initSeedOrders());
    const expenses = getStorage<Expense[]>(STORAGE_KEYS.EXPENSES, initSeedExpenses());

    let grossSales = 0;
    let discounts = 0;
    let shippingCollected = 0;
    let cogs = 0;

    orders.forEach((o) => {
      if (o.fulfillmentStatus !== 'cancelled') {
        grossSales += o.financials?.subtotal || 0;
        discounts += o.financials?.discount || 0;
        shippingCollected += o.financials?.shipping || 0;
        cogs += o.financials?.cogs || 0;
      }
    });

    const netSales = grossSales - discounts;
    const grossProfit = netSales - cogs;
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netOperatingProfit = grossProfit - totalExpenses;
    const grossMarginPercent = netSales > 0 ? (grossProfit / netSales) * 100 : 0;
    const netProfitMarginPercent = netSales > 0 ? (netOperatingProfit / netSales) * 100 : 0;

    return {
      period: 'current_year',
      dateRange: { start: '2026-01-01', end: '2026-12-31', timeZone: 'Asia/Dhaka' },
      metrics: {
        grossSalesBdt: grossSales,
        discountsBdt: discounts,
        shippingCollectedBdt: shippingCollected,
        cancelledOrdersCount: orders.filter((o) => o.fulfillmentStatus === 'cancelled').length,
        cancelledValueBdt: 0,
        returnsCount: 0,
        returnsValueBdt: 0,
        netSalesBdt: netSales,
        cogsBdt: cogs,
        grossProfitBdt: grossProfit,
        grossMarginPercent: parseFloat(grossMarginPercent.toFixed(2)),
        operatingExpensesBdt: totalExpenses,
        netOperatingProfitBdt: netOperatingProfit,
        netProfitMarginPercent: parseFloat(netProfitMarginPercent.toFixed(2)),
        collectedPaymentsBdt: netSales,
        outstandingCodSettlementsBdt: 0,
        outstandingCodOrdersCount: 0,
        totalOrdersCount: orders.length,
        allOrdersCount: orders.length,
        averageOrderValueBdt: orders.length > 0 ? Math.round(netSales / orders.length) : 0,
      },
      bestSellers: [],
      lowStockProducts: [],
      timelineChart: [],
      formulasDocumentation: {},
    };
  },

  // 8. Audit Logs
  getAuditLogs(): { total: number; page: number; limit: number; totalPages: number; logs: AuditLogEntry[] } {
    let logs = getStorage<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    if (!logs || logs.length === 0) {
      logs = [
        {
          id: 'log-seed-01',
          actor: 'admin',
          role: 'super_admin',
          action: 'SYSTEM_BOOT',
          entity: 'system',
          entityId: 'sys-01',
          details: { message: 'Local Storage Database Engine Initialized' },
          ip: '127.0.0.1 (Local Client)',
          timestamp: new Date().toISOString(),
        },
      ];
      setStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
    }
    return {
      total: logs.length,
      page: 1,
      limit: 25,
      totalPages: 1,
      logs,
    };
  },
};
