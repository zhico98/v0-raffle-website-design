-- Create user stats table
create table if not exists public.user_stats (
  wallet_address text primary key,
  total_tickets integer default 0,
  total_spent numeric default 0,
  total_won numeric default 0,
  raffles_entered integer default 0,
  raffles_won integer default 0,
  updated_at timestamp with time zone default now(),
  
  constraint fk_wallet_address
    foreign key (wallet_address)
    references public.user_profiles(wallet_address)
    on delete cascade
);

-- Enable RLS
alter table public.user_stats enable row level security;

-- Create policies for user stats
create policy "Users can view all stats"
  on public.user_stats for select
  using (true);

create policy "Users can insert their own stats"
  on public.user_stats for insert
  with check (true);

create policy "Users can update their own stats"
  on public.user_stats for update
  using (true);

-- Create function to update stats when transaction is added
create or replace function update_user_stats()
returns trigger as $$
begin
  insert into public.user_stats (wallet_address, total_tickets, total_spent, raffles_entered)
  values (
    new.user_address,
    new.ticket_count,
    new.amount,
    1
  )
  on conflict (wallet_address)
  do update set
    total_tickets = user_stats.total_tickets + new.ticket_count,
    total_spent = user_stats.total_spent + new.amount,
    raffles_entered = user_stats.raffles_entered + 1,
    updated_at = now();
  
  return new;
end;
$$ language plpgsql;

-- Create trigger to auto-update stats
drop trigger if exists on_transaction_created on public.transactions;
create trigger on_transaction_created
  after insert on public.transactions
  for each row
  execute function update_user_stats();
