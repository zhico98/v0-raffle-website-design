import { createClient } from "@/lib/supabase/client"

export interface UserProfile {
  wallet_address: string
  username: string | null
  avatar_url: string | null
  created_at?: string
  updated_at?: string
}

export interface Transaction {
  id?: string
  user_address: string
  raffle_id: string
  raffle_name: string
  amount: number
  ticket_count: number
  tx_hash: string
  status: string
  created_at?: string
}

export interface UserStats {
  wallet_address: string
  total_tickets: number
  total_spent: number
  total_won: number
  raffles_entered: number
  raffles_won: number
  updated_at?: string
}

export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single()

  if (error) {
    console.error("[v0] Error fetching user profile:", error)
    return null
  }

  return data
}

export async function upsertUserProfile(profile: UserProfile): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("user_profiles").upsert({
    wallet_address: profile.wallet_address.toLowerCase(),
    username: profile.username,
    avatar_url: profile.avatar_url,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("[v0] Error upserting user profile:", error)
    return false
  }

  console.log("[v0] User profile saved to Supabase")
  return true
}

export async function saveTransaction(transaction: Transaction): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("transactions").insert({
    user_address: transaction.user_address.toLowerCase(),
    raffle_id: transaction.raffle_id,
    raffle_name: transaction.raffle_name,
    amount: transaction.amount,
    ticket_count: transaction.ticket_count,
    tx_hash: transaction.tx_hash,
    status: transaction.status,
  })

  if (error) {
    console.error("[v0] Error saving transaction:", error)
    return false
  }

  console.log("[v0] Transaction saved to Supabase")
  return true
}

export async function getUserTransactions(walletAddress: string): Promise<Transaction[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_address", walletAddress.toLowerCase())
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching transactions:", error)
    return []
  }

  return data || []
}

export async function getUserStats(walletAddress: string): Promise<UserStats | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single()

  if (error) {
    console.error("[v0] Error fetching user stats:", error)
    return null
  }

  return data
}
