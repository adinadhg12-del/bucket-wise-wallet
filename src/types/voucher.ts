export type VoucherCategory = 'shopping' | 'food' | 'entertainment' | 'travel';

export interface VoucherTemplate {
  id: string;
  brand: string;
  category: VoucherCategory;
  description: string;
  values: number[];
  icon: string;
  color: string;
}

export interface PurchasedVoucher {
  id: string;
  brand: string;
  category: string;
  value: number;
  voucherCode: string;
  status: 'active' | 'used' | 'expired';
  createdAt: string;
}

export const VOUCHER_CATEGORIES: Record<VoucherCategory, { name: string; icon: string }> = {
  shopping: { name: 'Shopping', icon: '🛍️' },
  food: { name: 'Food', icon: '🍕' },
  entertainment: { name: 'Entertainment', icon: '🎮' },
  travel: { name: 'Travel', icon: '✈️' },
};

export const VOUCHER_CATALOG: VoucherTemplate[] = [
  { id: 'amazon', brand: 'Amazon', category: 'shopping', description: 'Shop everything on Amazon', values: [100, 250, 500, 1000], icon: '📦', color: 'hsl(38 92% 50%)' },
  { id: 'flipkart', brand: 'Flipkart', category: 'shopping', description: 'India\'s top online store', values: [100, 500, 1000], icon: '🛒', color: 'hsl(210 80% 50%)' },
  { id: 'myntra', brand: 'Myntra', category: 'shopping', description: 'Fashion & lifestyle', values: [250, 500, 1000], icon: '👗', color: 'hsl(330 75% 55%)' },
  { id: 'swiggy', brand: 'Swiggy', category: 'food', description: 'Order food delivery', values: [100, 200, 500], icon: '🍔', color: 'hsl(24 95% 53%)' },
  { id: 'zomato', brand: 'Zomato', category: 'food', description: 'Restaurants & dining', values: [100, 250, 500], icon: '🍽️', color: 'hsl(0 72% 51%)' },
  { id: 'starbucks', brand: 'Starbucks', category: 'food', description: 'Coffee & beverages', values: [100, 250], icon: '☕', color: 'hsl(150 60% 35%)' },
  { id: 'bookmyshow', brand: 'BookMyShow', category: 'entertainment', description: 'Movies & events', values: [100, 250, 500], icon: '🎬', color: 'hsl(0 72% 51%)' },
  { id: 'spotify', brand: 'Spotify', category: 'entertainment', description: 'Music streaming', values: [100, 250, 500], icon: '🎵', color: 'hsl(140 63% 42%)' },
  { id: 'netflix', brand: 'Netflix', category: 'entertainment', description: 'Stream movies & shows', values: [250, 500, 1000], icon: '📺', color: 'hsl(0 72% 51%)' },
  { id: 'makemytrip', brand: 'MakeMyTrip', category: 'travel', description: 'Flights & hotels', values: [500, 1000, 2000], icon: '🏨', color: 'hsl(210 80% 50%)' },
  { id: 'uber', brand: 'Uber', category: 'travel', description: 'Rides & transport', values: [100, 250, 500], icon: '🚗', color: 'hsl(0 0% 15%)' },
  { id: 'irctc', brand: 'IRCTC', category: 'travel', description: 'Train bookings', values: [250, 500, 1000], icon: '🚂', color: 'hsl(210 80% 40%)' },
];
