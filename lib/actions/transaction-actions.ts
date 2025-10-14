"use server"

import { createClient } from "@/lib/supabase/server"

export interface Transaction {
  hash: string
  type: "raffle_entry" | "prize_claim" | "refund"
  raffleId: number
  amount: string
  ticketCount?: number
  timestamp: number
  status: "pending" | "confirmed" | "failed"
  roundId?: string
}

export async function saveTransaction(walletAddress: string, transaction: Transaction) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_address: walletAddress.toLowerCase(),
        raffle_id: transaction.raffleId.toString(),
        raffle_name: `Raffle ${transaction.raffleId}`,
        amount: Number.parseFloat(transaction.amount),
        ticket_count: transaction.ticketCount || 1,
        tx_hash: transaction.hash,
        status: transaction.status,
        type: transaction.type,
        round_id: transaction.roundId,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error saving transaction:", error)
    return { success: false, error }
  }
}

export async function getTransactions(walletAddress: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_address", walletAddress.toLowerCase())
      .order("created_at", { ascending: false })

    if (error) throw error

    // Convert to Transaction format
    const transactions: Transaction[] = (data || []).map((t: any) => ({
      hash: t.tx_hash,
      type: t.type || "raffle_entry",
      raffleId: Number.parseInt(t.raffle_id),
      amount: t.amount.toString(),
      ticketCount: t.ticket_count,
      timestamp: new Date(t.created_at).getTime(),
      status: t.status,
      roundId: t.round_id,
    }))

    return { success: true, data: transactions }
  } catch (error) {
    console.error("[v0] Error getting transactions:", error)
    return { success: false, data: [] }
  }
}

export async function hasEnteredRaffle(walletAddress: string, raffleId: number, roundId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("transactions")
      .select("id")
      .eq("user_address", walletAddress.toLowerCase())
      .eq("raffle_id", raffleId.toString())
      .eq("round_id", roundId)
      .eq("type", "raffle_entry")
      .limit(1)

    if (error) throw error
    return { success: true, hasEntered: (data?.length || 0) > 0 }
  } catch (error) {
    console.error("[v0] Error checking raffle entry:", error)
    return { success: false, hasEntered: false }
  }
}
