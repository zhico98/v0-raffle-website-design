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

    // Check if any rounds exist
    const { data: existingRounds, error: checkError } = await supabase.from("raffle_rounds").select("id").limit(1)

    if (checkError) throw checkError

    // If rounds already exist, don't initialize
    if (existingRounds && existingRounds.length > 0) {
      return { success: true, message: "Rounds already initialized" }
    }

    // Create initial rounds for all 4 raffles
    const raffleIds = [1, 2, 3, 4]
    const now = new Date()
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)

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

    console.log("[v0] Successfully initialized raffle rounds")
    return { success: true, message: "Raffle rounds initialized" }
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
