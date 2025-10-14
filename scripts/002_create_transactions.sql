-- Create transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_address text not null,
  raffle_id text not null,
  raffle_name text not null,
  amount numeric not null,
  ticket_count integer not null,
  tx_hash text not null,
  status text not null default 'pending',
  created_at timestamp with time zone default now(),
  
  constraint fk_user_address
    foreign key (user_address)
    references public.user_profiles(wallet_address)
    on delete cascade
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Create policies for transactions
create policy "Users can view all transactions"
  on public.transactions for select
  using (true);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (true);

-- Create index for faster queries
create index if not exists idx_transactions_user_address on public.transactions(user_address);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);
