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

    const now = new Date().toISOString()
    const { data: activeRounds, error: checkError } = await supabase
      .from("raffle_rounds")
      .select("raffle_id")
      .eq("status", "active")
      .gte("end_time", now)

    if (checkError) throw checkError

    console.log("[v0] Active rounds found:", activeRounds?.length || 0)

    // Get list of raffle IDs that need initialization
    const raffleIds = [1, 2, 3, 4]
    const activeRaffleIds = new Set(activeRounds?.map((r) => r.raffle_id) || [])
    const rafflesNeedingInit = raffleIds.filter((id) => !activeRaffleIds.has(id.toString()))

    console.log("[v0] Raffles needing initialization:", rafflesNeedingInit)

    // If all raffles have active rounds, don't initialize
    if (rafflesNeedingInit.length === 0) {
      console.log("[v0] All raffles have active rounds")
      return { success: true, message: "All raffles have active rounds" }
    }

    // Create rounds only for raffles that need them
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000)

    const roundsToInsert = rafflesNeedingInit.map((raffleId) => ({
      raffle_id: raffleId.toString(),
      round_number: 1,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "active",
      total_tickets_sold: 0,
      total_prize_pool: 0,
    }))

    const { error: insertError } = await supabase.from("raffle_rounds").insert(roundsToInsert)

    if (insertError) throw insertError

    console.log("[v0] Successfully initialized", rafflesNeedingInit.length, "raffle rounds")
    return { success: true, message: `Initialized ${rafflesNeedingInit.length} raffle rounds` }
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
