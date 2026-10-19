export type AdminRole = 'super_admin' | 'inventory_manager' | 'finance_viewer';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
}

export interface ProductAdmin {
  id: string;
  sku: string;
  title: string;
  vendor: string;
  category: string;
  department: string;
  handle: string;
  price: number;
  costPrice: number;
  oldPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  status: 'active' | 'draft' | 'archived';
  sizes: string[];
  color: string;
  images: string[];
  description: string;
  franchise?: string;
  isNew?: boolean;
  isExclusive?: boolean;
  rating?: number;
  reviewsCount?: number;
  specs?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem extends ProductAdmin {
  costValuation: number;
  retailValuation: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface LedgerEntry {
  movementId: string;
  productId: string;
  sku: string;
  productTitle: string;
  type: 'initial' | 'purchase' | 'sale' | 'return' | 'damage' | 'adjustment' | 'reconciliation';
  quantityDelta: number;
  unitCost: number;
  totalCost: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string;
  reason: string;
  actor: string;
  timestamp: string;
}

export interface CustomerAddress {
  fullName: string;
  phone: string;
  email?: string;
  division: string;
  district: string;
  thana?: string;
  address: string;
  postalCode?: string;
  notes?: string;
}

export interface OrderItemSnapshot {
  productId: string;
  sku: string;
  title: string;
  selectedSize: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  totalPrice: number;
  image?: string;
}

export interface OrderAdmin {
  orderId: string;
  trackingNumber: string;
  date: string;
  status: string;
  fulfillmentStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'card';
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'refunded';
  paymentDetails?: {
    trxId?: string;
    paymentChannel?: string;
    settledAt?: string;
    settledBy?: string;
  };
  courier: string;
  deliveryZone: 'inside_dhaka' | 'outside_dhaka';
  estimatedDelivery: string;
  customer: CustomerAddress;
  items: OrderItemSnapshot[];
  financials: {
    currency: string;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    cogs: number;
  };
  history: Array<{
    timestamp: string;
    actor: string;
    action: string;
    note?: string;
  }>;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categoriesSupplied: string[];
  totalPurchases: number;
  balanceOwed: number;
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  sku: string;
  title: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  status: 'received' | 'ordered' | 'cancelled';
  items: PurchaseOrderItem[];
  additionalCosts: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  amountPaid: number;
  balanceDue: number;
  paymentReference?: string;
  notes?: string;
  receivedBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
  recordedBy: string;
  receiptRef?: string;
  createdAt: string;
}

export interface FinancialReport {
  period: string;
  dateRange: { start: string; end: string; timeZone: string };
  metrics: {
    grossSalesBdt: number;
    discountsBdt: number;
    shippingCollectedBdt: number;
    cancelledOrdersCount: number;
    cancelledValueBdt: number;
    returnsCount: number;
    returnsValueBdt: number;
    netSalesBdt: number;
    cogsBdt: number;
    grossProfitBdt: number;
    grossMarginPercent: number;
    operatingExpensesBdt: number;
    netOperatingProfitBdt: number;
    netProfitMarginPercent: number;
    collectedPaymentsBdt: number;
    outstandingCodSettlementsBdt: number;
    outstandingCodOrdersCount: number;
    totalOrdersCount: number;
    allOrdersCount: number;
    averageOrderValueBdt: number;
  };
  bestSellers: Array<{
    productId: string;
    sku: string;
    title: string;
    image?: string;
    unitsSold: number;
    revenue: number;
    grossProfit: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    sku: string;
    title: string;
    vendor: string;
    stock: number;
    lowStockThreshold: number;
    costPrice: number;
    sellingPrice: number;
    isOutOfStock: boolean;
  }>;
  timelineChart: Array<{
    date: string;
    grossSales: number;
    netSales: number;
    cogs: number;
    profit: number;
    orders: number;
  }>;
  formulasDocumentation: Record<string, string>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, any>;
  ip: string;
}
