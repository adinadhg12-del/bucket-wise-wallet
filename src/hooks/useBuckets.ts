import { useState, useEffect } from 'react';
import { Bucket, BucketType, BUCKET_CONFIG, Transaction } from '@/types/bucket';

const STORAGE_KEY = 'bucket-spending-data';
const TRANSACTIONS_KEY = 'bucket-transactions';

const getInitialBuckets = (): Bucket[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return Object.entries(BUCKET_CONFIG).map(([id, config]) => ({
    id: id as BucketType,
    name: config.name,
    icon: config.icon,
    budget: 0,
    spent: 0,
  }));
};

const getInitialTransactions = (): Transaction[] => {
  const saved = localStorage.getItem(TRANSACTIONS_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return [];
};

export const useBuckets = () => {
  const [buckets, setBuckets] = useState<Bucket[]>(getInitialBuckets);
  const [transactions, setTransactions] = useState<Transaction[]>(getInitialTransactions);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buckets));
  }, [buckets]);

  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const updateBudget = (bucketId: BucketType, budget: number) => {
    setBuckets(prev =>
      prev.map(b => (b.id === bucketId ? { ...b, budget } : b))
    );
  };

  const getBalance = (bucketId: BucketType): number => {
    const bucket = buckets.find(b => b.id === bucketId);
    if (!bucket) return 0;
    return bucket.budget - bucket.spent;
  };

  const canAfford = (bucketId: BucketType, amount: number): boolean => {
    return getBalance(bucketId) >= amount;
  };

  const recordPayment = (bucketId: BucketType, amount: number, status: 'success' | 'failed') => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      bucketId,
      amount,
      date: new Date().toISOString(),
      status,
    };
    
    setTransactions(prev => [transaction, ...prev]);

    if (status === 'success') {
      setBuckets(prev =>
        prev.map(b => (b.id === bucketId ? { ...b, spent: b.spent + amount } : b))
      );
    }
  };

  const resetMonth = () => {
    setBuckets(prev =>
      prev.map(b => ({ ...b, spent: 0 }))
    );
    setTransactions([]);
  };

  const totalBudget = buckets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = buckets.reduce((sum, b) => sum + b.spent, 0);

  return {
    buckets,
    transactions,
    updateBudget,
    getBalance,
    canAfford,
    recordPayment,
    resetMonth,
    totalBudget,
    totalSpent,
  };
};
