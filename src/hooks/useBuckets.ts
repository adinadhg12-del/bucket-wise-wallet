import { useState, useEffect, useCallback } from 'react';
import { Bucket, BucketType, BUCKET_CONFIG, Transaction } from '@/types/bucket';
import { supabase } from '@/integrations/supabase/client';

export const useBuckets = (userId: string) => {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    // Fetch budgets
    const { data: budgetData } = await (supabase as any)
      .from('user_budgets')
      .select('*')
      .eq('user_id', userId);

    const bucketList = Object.entries(BUCKET_CONFIG).map(([id, config]) => {
      const dbBucket = budgetData?.find((b: any) => b.bucket_type === id);
      return {
        id: id as BucketType,
        name: config.name,
        icon: config.icon,
        budget: Number(dbBucket?.budget) || 0,
        spent: Number(dbBucket?.spent) || 0,
      };
    });
    setBuckets(bucketList);

    // Fetch transactions
    const { data: txData } = await (supabase as any)
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    setTransactions(
      txData?.map((t: any) => ({
        id: t.id,
        bucketId: t.bucket_type as BucketType,
        amount: Number(t.amount),
        date: t.created_at,
        status: t.status as 'success' | 'failed' | 'pending',
      })) || []
    );

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateBudget = async (bucketId: BucketType, budget: number) => {
    // Upsert the budget
    await (supabase as any)
      .from('user_budgets')
      .upsert(
        { user_id: userId, bucket_type: bucketId, budget },
        { onConflict: 'user_id,bucket_type' }
      );

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

  const recordPayment = async (bucketId: BucketType, amount: number, status: 'success' | 'failed') => {
    // Insert transaction
    await (supabase as any)
      .from('transactions')
      .insert({
        user_id: userId,
        bucket_type: bucketId,
        amount,
        status,
      });

    // Update spent amount if success
    if (status === 'success') {
      const bucket = buckets.find(b => b.id === bucketId);
      const newSpent = (bucket?.spent || 0) + amount;
      await (supabase as any)
        .from('user_budgets')
        .update({ spent: newSpent })
        .eq('user_id', userId)
        .eq('bucket_type', bucketId);

      setBuckets(prev =>
        prev.map(b => (b.id === bucketId ? { ...b, spent: newSpent } : b))
      );
    }

    // Refresh transactions
    fetchData();
  };

  const resetMonth = async () => {
    // Reset all spent to 0
    await (supabase as any)
      .from('user_budgets')
      .update({ spent: 0 })
      .eq('user_id', userId);

    setBuckets(prev => prev.map(b => ({ ...b, spent: 0 })));
    setTransactions([]);
  };

  const initializeBudgets = async (budgets: Record<BucketType, number>) => {
    const rows = Object.entries(budgets).map(([type, budget]) => ({
      user_id: userId,
      bucket_type: type,
      budget,
      spent: 0,
    }));

    await (supabase as any)
      .from('user_budgets')
      .upsert(rows, { onConflict: 'user_id,bucket_type' });

    await fetchData();
  };

  const totalBudget = buckets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = buckets.reduce((sum, b) => sum + b.spent, 0);

  return {
    buckets,
    transactions,
    loading,
    updateBudget,
    getBalance,
    canAfford,
    recordPayment,
    resetMonth,
    initializeBudgets,
    totalBudget,
    totalSpent,
  };
};
