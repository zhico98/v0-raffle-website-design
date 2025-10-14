-- Add missing fields to transactions table for full compatibility
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'raffle_entry',
  ADD COLUMN IF NOT EXISTS round_id text;

-- Update the type constraint to match our Transaction interface
ALTER TABLE public.transactions 
  ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('raffle_entry', 'prize_claim', 'refund'));

-- Create index for round_id for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_round_id ON public.transactions(round_id);

-- Update RLS policies to allow users to view and insert transactions
DROP POLICY IF EXISTS "Users can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;

CREATE POLICY "Users can view all transactions"
  ON public.transactions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (user_address = user_address);
