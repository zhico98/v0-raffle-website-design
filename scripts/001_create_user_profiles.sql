-- Create user profiles table
create table if not exists public.user_profiles (
  wallet_address text primary key,
  username text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Create policies for user profiles
create policy "Users can view all profiles"
  on public.user_profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (true);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

create policy "Users can delete their own profile"
  on public.user_profiles for delete
  using (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');
