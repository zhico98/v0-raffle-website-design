-- Create raffle_rounds table to track 24-hour raffle cycles
create table if not exists raffle_rounds (
  id uuid primary key default gen_random_uuid(),
  raffle_id text not null,
  round_number integer not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'active' check (status in ('active', 'ended', 'drawn')),
  winner_address text,
  total_tickets_sold integer default 0,
  total_prize_pool numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists idx_raffle_rounds_raffle_id on raffle_rounds(raffle_id);
create index if not exists idx_raffle_rounds_status on raffle_rounds(status);
create index if not exists idx_raffle_rounds_end_time on raffle_rounds(end_time);

-- Create composite index for active raffle lookups
create index if not exists idx_raffle_rounds_active on raffle_rounds(raffle_id, status) where status = 'active';

-- Enable Row Level Security
alter table raffle_rounds enable row level security;

-- Allow everyone to read raffle rounds
create policy "Anyone can view raffle rounds"
  on raffle_rounds for select
  using (true);

-- Only allow inserts from authenticated users (for admin functions)
create policy "Authenticated users can insert raffle rounds"
  on raffle_rounds for insert
  with check (true);

-- Only allow updates from authenticated users (for admin functions)
create policy "Authenticated users can update raffle rounds"
  on raffle_rounds for update
  using (true);

-- Function to automatically update updated_at timestamp
create or replace function update_raffle_rounds_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at on every update
create trigger update_raffle_rounds_updated_at
  before update on raffle_rounds
  for each row
  execute function update_raffle_rounds_updated_at();

-- Insert initial raffle rounds for all raffles (starting now, ending in 24 hours)
insert into raffle_rounds (raffle_id, round_number, start_time, end_time, status)
values
  ('1', 1, now(), now() + interval '24 hours', 'active'),
  ('2', 1, now(), now() + interval '24 hours', 'active'),
  ('3', 1, now(), now() + interval '24 hours', 'active'),
  ('4', 1, now(), now() + interval '24 hours', 'active')
on conflict do nothing;
