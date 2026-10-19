/**
 * Bangladesh Localization Utilities for Gazi Cricket Platform
 * Handles Divisions, Districts, Phone Validation, Shipping Zones, and BDT Formatting
 */

export interface BangladeshDivision {
  name: string;
  division?: string;
  nameBn: string;
  divisionBn?: string;
  districts: string[];
}

export const BANGLADESH_DIVISIONS: BangladeshDivision[] = [
  {
    name: 'Dhaka',
    division: 'Dhaka',
    nameBn: 'ঢাকা',
    divisionBn: 'ঢাকা',
    districts: ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Faridpur', 'Manikganj', 'Munshiganj', 'Narsingdi', 'Kishoreganj', 'Gopalganj', 'Madaripur', 'Rajbari', 'Shariatpur'],
  },
  {
    name: 'Chattogram',
    division: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    divisionBn: 'চট্টগ্রাম',
    districts: ['Chattogram', 'Cox\'s Bazar', 'Cumilla', 'Feni', 'Brahmanbaria', 'Chandpur', 'Noakhali', 'Lakshmipur', 'Khagrachhari', 'Rangamati', 'Bandarban'],
  },
  {
    name: 'Sylhet',
    division: 'Sylhet',
    nameBn: 'সিলেট',
    divisionBn: 'সিলেট',
    districts: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  },
  {
    name: 'Rajshahi',
    division: 'Rajshahi',
    nameBn: 'রাজশাহী',
    divisionBn: 'রাজশাহী',
    districts: ['Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Naogaon', 'Natore', 'Chapai Nawabganj', 'Joypurhat'],
  },
  {
    name: 'Khulna',
    division: 'Khulna',
    nameBn: 'খুলনা',
    divisionBn: 'খুলনা',
    districts: ['Khulna', 'Jashore', 'Satkhira', 'Kushtia', 'Bagerhat', 'Jhenaidah', 'Chuadanga', 'Meherpur', 'Magura', 'Narail'],
  },
  {
    name: 'Barishal',
    division: 'Barishal',
    nameBn: 'বরিশাল',
    divisionBn: 'বরিশাল',
    districts: ['Barishal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalakathi', 'Barguna'],
  },
  {
    name: 'Rangpur',
    division: 'Rangpur',
    nameBn: 'রংপুর',
    divisionBn: 'রংপুর',
    districts: ['Rangpur', 'Dinajpur', 'Kurigram', 'Gaibandha', 'Nilphamari', 'Lalmonirhat', 'Thakurgaon', 'Panchagarh'],
  },
  {
    name: 'Mymensingh',
    division: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    divisionBn: 'ময়মনসিংহ',
    districts: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
  },
];

export const BD_DIVISIONS = BANGLADESH_DIVISIONS;

export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';

export interface ShippingConfig {
  zone: DeliveryZone;
  label: string;
  labelBn: string;
  fee: number;
  estimatedDelivery: string;
}

export const SHIPPING_CONFIG: Record<DeliveryZone, ShippingConfig> = {
  inside_dhaka: {
    zone: 'inside_dhaka',
    label: 'Inside Dhaka City (ঢাকা সিটি)',
    labelBn: 'ঢাকা সিটির ভেতরে (২৪-৪৮ ঘণ্টা)',
    fee: 70,
    estimatedDelivery: '24–48 Hours',
  },
  outside_dhaka: {
    zone: 'outside_dhaka',
    label: 'Outside Dhaka (ঢাকার বাইরে সারা বাংলাদেশ)',
    labelBn: 'ঢাকার বাইরে সারা বাংলাদেশ (২-৪ দিন)',
    fee: 130,
    estimatedDelivery: '2–4 Business Days',
  },
};

export const FREE_SHIPPING_THRESHOLD_BDT = 5000; // Free delivery on orders over ৳5,000

/**
 * Validates Bangladeshi Mobile Phone Number
 * Accepts: 017XXXXXXXX, 018XXXXXXXX, 019XXXXXXXX, 016XXXXXXXX, 015XXXXXXXX, 013XXXXXXXX, 014XXXXXXXX
 * Or international: +8801XXXXXXXXX / 8801XXXXXXXXX
 */
export function isValidBdPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s-]/g, '');
  // Matches +8801[3-9]\d{8} or 8801[3-9]\d{8} or 01[3-9]\d{8}
  const regex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
  return regex.test(clean);
}

/**
 * Normalizes a Bangladeshi phone number to standard format: 01XXXXXXXXX
 */
export function normalizeBdPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/[\s-]/g, '');
  const match = clean.match(/^(?:\+88|88)?(01[3-9]\d{8})$/);
  return match ? match[1] : clean;
}

/**
 * Centralized Currency Formatter for Bangladesh Taka (BDT)
 * Uses ৳ symbol with standard Bangladeshi comma separator (Lakh/Crore or thousands)
 */
export function formatBDT(amount: number, options?: { showDecimal?: boolean }): string {
  const isDecimal = options?.showDecimal ?? false;
  const rounded = isDecimal ? amount.toFixed(2) : Math.round(amount).toString();
  
  // Format with standard thousands separator
  const parts = rounded.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `৳${parts.join('.')}`;
}

/**
 * Converts English digits to Bengali numerals (optional display touch)
 */
export function toBengaliNumerals(str: string | number): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.toString().replace(/[0-9]/g, (w) => banglaDigits[+w]);
}

/**
 * Calculates delivery fee based on cart subtotal and selected zone
 */
export function calculateDeliveryFee(subtotalBdt: number, zone: DeliveryZone): number {
  if (subtotalBdt === 0) return 0;
  if (subtotalBdt >= FREE_SHIPPING_THRESHOLD_BDT) return 0;
  return SHIPPING_CONFIG[zone].fee;
}
