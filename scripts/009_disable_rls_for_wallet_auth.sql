-- Disable Row Level Security for wallet-based authentication
-- Since we're using crypto wallets instead of Supabase Auth,
-- we need to disable RLS or use permissive policies

-- Disable RLS on all tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_rounds DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might interfere
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view their own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON user_stats;
