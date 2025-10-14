import { createClient } from "@/lib/supabase/client"

export interface RaffleRound {
  id: string
  raffle_id: string
  round_number: number
  start_time: string
  end_time: string
  status: "active" | "ended" | "drawn"
  winner_address: string | null
  total_tickets_sold: number
  total_prize_pool: number
  created_at: string
  updated_at: string
}

/**
 * Get the current active round for a specific raffle
 */
export async function getCurrentRound(raffleId: string): Promise<RaffleRound | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("raffle_rounds")
    .select("*")
    .eq("raffle_id", raffleId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)

  if (error) {
    console.error("[v0] Error fetching current round:", error.message)
    return null
  }

  if (!data || data.length === 0) {
    console.log("[v0] No active round found for raffle:", raffleId)
    return null
  }

  return data[0]
}

/**
 * Get all active rounds (for all raffles)
 */
export async function getAllActiveRounds(): Promise<RaffleRound[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("raffle_rounds")
    .select("*")
    .eq("status", "active")
    .order("raffle_id", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching active rounds:", error)
    return []
  }

  return data || []
}

/**
 * Create a new raffle round (typically called when previous round ends)
 */
export async function createNewRound(raffleId: string, roundNumber: number): Promise<RaffleRound | null> {
  const supabase = createClient()

  const startTime = new Date()
  const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now

  const { data, error } = await supabase
    .from("raffle_rounds")
    .insert({
      raffle_id: raffleId,
      round_number: roundNumber,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "active",
    })
    .select()
    .limit(1)

  if (error) {
    console.error("[v0] Error creating new round:", error.message)
    return null
  }

  if (!data || data.length === 0) {
    console.error("[v0] Failed to create new round - no data returned")
    return null
  }

  console.log("[v0] New round created:", data[0])
  return data[0]
}

/**
 * Update round status (e.g., from active to ended)
 */
export async function updateRoundStatus(
  roundId: string,
  status: "active" | "ended" | "drawn",
  winnerAddress?: string,
): Promise<boolean> {
  const supabase = createClient()

  const updateData: any = { status }
  if (winnerAddress) {
    updateData.winner_address = winnerAddress
  }

  const { error } = await supabase.from("raffle_rounds").update(updateData).eq("id", roundId)

  if (error) {
    console.error("[v0] Error updating round status:", error)
    return false
  }

  console.log("[v0] Round status updated:", { roundId, status })
  return true
}

/**
 * Update ticket count for a round
 */
export async function updateRoundTickets(roundId: string, ticketCount: number, prizeAmount: number): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from("raffle_rounds")
    .update({
      total_tickets_sold: ticketCount,
      total_prize_pool: prizeAmount,
    })
    .eq("id", roundId)

  if (error) {
    console.error("[v0] Error updating round tickets:", error)
    return false
  }

  return true
}

/**
 * Check if any rounds have expired and need to be ended
 */
export async function checkExpiredRounds(): Promise<RaffleRound[]> {
  const supabase = createClient()

  const now = new Date().toISOString()

  const { data, error } = await supabase.from("raffle_rounds").select("*").eq("status", "active").lt("end_time", now)

  if (error) {
    console.error("[v0] Error checking expired rounds:", error)
    return []
  }

  return data || []
}

/**
 * Get round history for a specific raffle
 */
export async function getRoundHistory(raffleId: string, limit = 10): Promise<RaffleRound[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("raffle_rounds")
    .select("*")
    .eq("raffle_id", raffleId)
    .order("round_number", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching round history:", error)
    return []
  }

  return data || []
}
