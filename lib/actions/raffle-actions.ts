"use server"

import { createClient } from "@/lib/supabase/server"

export interface RaffleRound {
  id: string
  raffle_id: string
  round_number: number
  start_time: string
  end_time: string
  status: string
  winner_address?: string
  total_tickets_sold: number
  total_prize_pool: number
}

export async function initializeRaffleRounds() {
  try {
    const supabase = await createClient()

    const now = new Date()
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Delete all existing rounds to start fresh
    const { error: deleteError } = await supabase
      .from("raffle_rounds")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all

    if (deleteError) {
      console.error("[v0] Error deleting old rounds:", deleteError)
    }

    // Create fresh 24-hour rounds for all raffles
    const raffleIds = [1, 2, 3, 4]
    const roundsToInsert = raffleIds.map((raffleId) => ({
      raffle_id: raffleId.toString(),
      round_number: 1,
      start_time: now.toISOString(),
      end_time: endTime.toISOString(),
      status: "active",
      total_tickets_sold: 0,
      total_prize_pool: 0,
    }))

    const { error: insertError } = await supabase.from("raffle_rounds").insert(roundsToInsert)

    if (insertError) throw insertError

    console.log("[v0] Successfully reset all raffle rounds to 24 hours from now")
    return { success: true, message: "All raffle rounds reset to 24 hours" }
  } catch (error) {
    console.error("[v0] Error initializing raffle rounds:", error)
    return { success: false, message: "Failed to initialize rounds" }
  }
}

export async function getCurrentRound(raffleId: number) {
  try {
    const supabase = await createClient()

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("raffle_rounds")
      .select("*")
      .eq("raffle_id", raffleId.toString())
      .eq("status", "active")
      .lte("start_time", now)
      .gte("end_time", now)
      .order("start_time", { ascending: false })
      .limit(1)

    if (error) throw error

    const round = data && data.length > 0 ? data[0] : null

    if (round) {
      console.log("[v0] Current round found:", {
        id: round.id,
        raffleId: round.raffle_id,
        startTime: round.start_time,
        endTime: round.end_time,
        now: now,
        isActive: new Date(round.end_time) > new Date(now),
      })
    } else {
      console.log("[v0] No active round found for raffle", raffleId, "at time", now)
    }

    return { success: true, data: round }
  } catch (error) {
    console.error("[v0] Error fetching current round:", error)
    return { success: false, data: null }
  }
}

export async function createNewRound(raffleId: number, roundNumber: number) {
  try {
    const supabase = await createClient()

    const now = new Date()
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from("raffle_rounds")
      .insert({
        raffle_id: raffleId.toString(),
        round_number: roundNumber,
        start_time: now.toISOString(),
        end_time: endTime.toISOString(),
        status: "active",
        total_tickets_sold: 0,
        total_prize_pool: 0,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error creating new round:", error)
    return { success: false, data: null }
  }
}

export async function updateRoundTicketCount(roundId: string, ticketCount: number) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("raffle_rounds")
      .update({
        total_tickets_sold: ticketCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roundId)

    if (error) throw error

    console.log("[v0] Updated round ticket count:", { roundId, ticketCount })
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating round ticket count:", error)
    return { success: false, error }
  }
}
