
CREATE TABLE public.purchased_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  value NUMERIC NOT NULL,
  voucher_code TEXT NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.purchased_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vouchers"
ON public.purchased_vouchers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vouchers"
ON public.purchased_vouchers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vouchers"
ON public.purchased_vouchers FOR UPDATE
USING (auth.uid() = user_id);
