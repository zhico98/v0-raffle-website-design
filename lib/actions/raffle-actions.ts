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

    // Check if there are any active rounds
    const { data: existingRounds, error: checkError } = await supabase
      .from("raffle_rounds")
      .select("*")
      .eq("status", "active")

    if (checkError) {
      console.error("[v0] Error checking existing rounds:", checkError)
    }

    // If active rounds exist, don't create new ones
    if (existingRounds && existingRounds.length > 0) {
      console.log("[v0] Active rounds already exist, skipping initialization")
      return { success: true, message: "Active rounds already exist" }
    }

    // Only create new rounds if none exist
    const now = new Date()
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)

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

    console.log("[v0] Successfully created initial 24-hour raffle rounds")
    return { success: true, message: "Initial raffle rounds created" }
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
      .order("start_time", { ascending: false })
      .limit(1)

    if (error) throw error

    let round = data && data.length > 0 ? data[0] : null

    if (round) {
      const endTime = new Date(round.end_time)
      const currentTime = new Date(now)

      if (currentTime > endTime) {
        console.log("[v0] Round expired, creating new round for raffle:", raffleId)

        // Mark current round as ended
        await supabase.from("raffle_rounds").update({ status: "ended" }).eq("id", round.id)

        // Get the highest round number for this raffle
        const { data: allRounds } = await supabase
          .from("raffle_rounds")
          .select("round_number")
          .eq("raffle_id", raffleId.toString())
          .order("round_number", { ascending: false })
          .limit(1)

        const nextRoundNumber = allRounds && allRounds.length > 0 ? allRounds[0].round_number + 1 : 1

        // Create new round
        const newRoundResult = await createNewRound(raffleId, nextRoundNumber)
        round = newRoundResult.data

        console.log("[v0] Auto-created new round:", round)
      }
    } else {
      console.log("[v0] No active round found, creating new round for raffle:", raffleId)

      const { data: allRounds } = await supabase
        .from("raffle_rounds")
        .select("round_number")
        .eq("raffle_id", raffleId.toString())
        .order("round_number", { ascending: false })
        .limit(1)

      const nextRoundNumber = allRounds && allRounds.length > 0 ? allRounds[0].round_number + 1 : 1

      const newRoundResult = await createNewRound(raffleId, nextRoundNumber)
      round = newRoundResult.data

      console.log("[v0] Created new round:", round)
    }

    if (round) {
      console.log("[v0] Current round:", {
        id: round.id,
        raffleId: round.raffle_id,
        roundNumber: round.round_number,
        endTime: round.end_time,
        isActive: new Date(round.end_time) > new Date(now),
      })
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
