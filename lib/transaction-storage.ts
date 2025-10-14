import { createClient } from "@/lib/supabase/client"

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

export async function saveTransaction(address: string, transaction: Transaction) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("transactions").insert({
      user_address: address.toLowerCase(),
      raffle_id: transaction.raffleId.toString(),
      raffle_name: `Raffle ${transaction.raffleId}`,
      amount: Number.parseFloat(transaction.amount),
      ticket_count: transaction.ticketCount || 1,
      tx_hash: transaction.hash,
      status: transaction.status,
      type: transaction.type,
      round_id: transaction.roundId,
      created_at: new Date(transaction.timestamp).toISOString(),
    })

    if (error) {
      console.error("[v0] Error saving transaction to Supabase:", error)
      throw error
    }

    console.log("[v0] Transaction saved to Supabase:", transaction)
  } catch (error) {
    console.error("[v0] Error saving transaction:", error)
    throw error
  }
}

export async function getTransactions(address: string): Promise<Transaction[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_address", address.toLowerCase())
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error loading transactions from Supabase:", error)
      return []
    }

    // Convert Supabase format to Transaction interface
    return (
      data?.map((tx) => ({
        hash: tx.tx_hash,
        type: tx.type as "raffle_entry" | "prize_claim" | "refund",
        raffleId: Number.parseInt(tx.raffle_id),
        amount: tx.amount.toString(),
        ticketCount: tx.ticket_count,
        timestamp: new Date(tx.created_at).getTime(),
        status: tx.status as "pending" | "confirmed" | "failed",
        roundId: tx.round_id,
      })) || []
    )
  } catch (error) {
    console.error("[v0] Error loading transactions:", error)
    return []
  }
}

export async function updateTransactionStatus(address: string, hash: string, status: "confirmed" | "failed") {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from("transactions")
      .update({ status })
      .eq("user_address", address.toLowerCase())
      .eq("tx_hash", hash)

    if (error) {
      console.error("[v0] Error updating transaction status in Supabase:", error)
      throw error
    }

    console.log("[v0] Transaction status updated in Supabase:", { hash, status })
  } catch (error) {
    console.error("[v0] Error updating transaction status:", error)
    throw error
  }
}

export async function hasUserEnteredRaffle(address: string, raffleId: number, roundId?: string): Promise<boolean> {
  try {
    const supabase = createClient()

    let query = supabase
      .from("transactions")
      .select("id")
      .eq("user_address", address.toLowerCase())
      .eq("raffle_id", raffleId.toString())
      .eq("type", "raffle_entry")
      .eq("status", "confirmed")

    // If roundId is provided, filter by it
    if (roundId) {
      query = query.eq("round_id", roundId)
    } else {
      // If no roundId, check for entries in the last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      query = query.gte("created_at", oneDayAgo)
    }

    const { data, error } = await query.limit(1)

    if (error) {
      console.error("[v0] Error checking raffle entry in Supabase:", error)
      return false
    }

    return (data?.length || 0) > 0
  } catch (error) {
    console.error("[v0] Error checking raffle entry:", error)
    return false
  }
}

export function calculateUserStats(transactions: Transaction[]) {
  const confirmedTransactions = transactions.filter((tx) => tx.status === "confirmed")

  const ticketsPurchased = confirmedTransactions
    .filter((tx) => tx.type === "raffle_entry")
    .reduce((sum, tx) => sum + (tx.ticketCount || 0), 0)

  const totalSpent = confirmedTransactions
    .filter((tx) => tx.type === "raffle_entry")
    .reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0)

  const rafflesEntered = new Set(
    confirmedTransactions.filter((tx) => tx.type === "raffle_entry").map((tx) => tx.raffleId),
  ).size

  const totalWinnings = confirmedTransactions
    .filter((tx) => tx.type === "prize_claim")
    .reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0)

  const rafflesWon = confirmedTransactions.filter((tx) => tx.type === "prize_claim").length

  return {
    ticketsPurchased,
    totalSpent: totalSpent.toFixed(4),
    rafflesEntered,
    rafflesWon,
    totalWinnings: totalWinnings.toFixed(4),
  }
}
