export type BucketType = 'food' | 'rent' | 'transport' | 'movies' | 'others';

export interface Bucket {
  id: BucketType;
  name: string;
  icon: string;
  budget: number;
  spent: number;
}

export interface Transaction {
  id: string;
  bucketId: BucketType;
  amount: number;
  date: string;
  status: 'success' | 'failed' | 'pending';
}

export const BUCKET_CONFIG: Record<BucketType, { name: string; icon: string }> = {
  food: { name: 'Food', icon: '🍔' },
  rent: { name: 'Rent', icon: '🏠' },
  transport: { name: 'Transport', icon: '🚗' },
  movies: { name: 'Movies', icon: '🎬' },
  others: { name: 'Others', icon: '📦' },
};
