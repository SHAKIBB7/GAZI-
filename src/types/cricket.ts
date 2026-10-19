export type CurrencyCode = 'BDT' | 'USD' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // Multiplier relative to BDT base
  label: string;
}

export interface Product {
  id: string;
  title: string;
  vendor: string;
  category: string;
  department: string;
  handle: string;
  price: number; // Price in BDT (৳)
  oldPrice?: number | null; // Regular price in BDT (৳)
  originalPriceGbp?: number; // Preserved source price in GBP for audit
  sizes: string[];
  color: string;
  images: string[];
  description: string;
  franchise?: string;
  isNew?: boolean;
  isExclusive?: boolean;
  rating: number;
  reviewsCount: number;
  specs?: Record<string, string>;
  stock?: number;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card';

export interface CustomerAddress {
  fullName: string;
  phone: string;
  division: string;
  district: string;
  thana: string;
  address: string;
  postalCode?: string;
  notes?: string;
}

export interface OrderFinancials {
  currency: CurrencyCode;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export interface Order {
  orderId: string;
  trackingNumber: string;
  date: string;
  status: string;
  estimatedDelivery: string;
  courier: string;
  customer: CustomerAddress;
  deliveryZone: DeliveryZone;
  paymentMethod: PaymentMethod;
  trxId?: string;
  items: CartItem[];
  financials: OrderFinancials;
}

export interface FilterState {
  department: string;
  vendor: string;
  maxPrice: number;
  onlySale: boolean;
  searchQuery: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  desktopImage: string;
  mobileImage: string;
  buttonText: string;
  collectionLink: string;
  categoryFilter?: string;
}

export interface DepartmentCard {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  categoryFilter: string;
  itemCount: number;
}
