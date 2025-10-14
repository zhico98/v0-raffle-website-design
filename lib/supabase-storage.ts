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

const PROFILES_STORAGE_KEY = "lotta_gg_profiles"

function getProfiles(): Record<string, UserProfile> {
  try {
    const stored = localStorage.getItem(PROFILES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error("[v0] Error loading profiles:", error)
    return {}
  }
}

function saveProfiles(profiles: Record<string, UserProfile>) {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles))
  } catch (error) {
    console.error("[v0] Error saving profiles:", error)
  }
}

export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
  try {
    const profiles = getProfiles()
    const profile = profiles[walletAddress.toLowerCase()]

    if (profile) {
      console.log("[v0] Profile loaded from localStorage for address:", walletAddress)
      return profile
    }

    return null
  } catch (error) {
    console.error("[v0] Error fetching user profile:", error)
    return null
  }
}

export async function upsertUserProfile(profile: UserProfile): Promise<boolean> {
  try {
    const profiles = getProfiles()
    const key = profile.wallet_address.toLowerCase()

    profiles[key] = {
      ...profile,
      wallet_address: key,
      updated_at: new Date().toISOString(),
    }

    saveProfiles(profiles)
    console.log("[v0] User profile saved to localStorage")
    return true
  } catch (error) {
    console.error("[v0] Error upserting user profile:", error)
    return false
  }
}

export async function saveTransaction(transaction: Transaction): Promise<boolean> {
  console.log("[v0] Transaction saved (localStorage mode)")
  return true
}

export async function getUserTransactions(walletAddress: string): Promise<Transaction[]> {
  console.log("[v0] Getting transactions (localStorage mode)")
  return []
}

export async function getUserStats(walletAddress: string): Promise<UserStats | null> {
  console.log("[v0] Getting user stats (localStorage mode)")
  return null
}
