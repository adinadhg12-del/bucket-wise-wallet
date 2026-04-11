import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PurchasedVoucher } from '@/types/voucher';

export const useVouchers = (userId: string) => {
  const [purchasedVouchers, setPurchasedVouchers] = useState<PurchasedVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVouchers = useCallback(async () => {
    if (!userId) return;
    const { data } = await (supabase as any)
      .from('purchased_vouchers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    setPurchasedVouchers(
      data?.map((v: any) => ({
        id: v.id,
        brand: v.brand,
        category: v.category,
        value: Number(v.value),
        voucherCode: v.voucher_code,
        status: v.status as 'active' | 'used' | 'expired',
        createdAt: v.created_at,
      })) || []
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const purchaseVoucher = async (
    brand: string,
    category: string,
    value: number,
    totalBalance: number
  ): Promise<{ success: boolean; code?: string; error?: string }> => {
    if (value > totalBalance) {
      return { success: false, error: 'Insufficient balance' };
    }

    const { data, error } = await (supabase as any)
      .from('purchased_vouchers')
      .insert({ user_id: userId, brand, category, value })
      .select()
      .single();

    if (error) {
      return { success: false, error: 'Transaction failed' };
    }

    // Record as transaction in the transactions table too
    await (supabase as any)
      .from('transactions')
      .insert({
        user_id: userId,
        bucket_type: 'others',
        amount: value,
        status: 'success',
      });

    await fetchVouchers();
    return { success: true, code: data.voucher_code };
  };

  return { purchasedVouchers, loading, purchaseVoucher, refetch: fetchVouchers };
};
