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

const TRANSACTIONS_STORAGE_KEY = "lotta_gg_transactions"

function getStorageKey(address: string): string {
  return `${TRANSACTIONS_STORAGE_KEY}_${address.toLowerCase()}`
}

export function saveTransaction(address: string, transaction: Transaction) {
  try {
    const key = getStorageKey(address)
    const transactions = JSON.parse(localStorage.getItem(key) || "[]")
    transactions.push(transaction)
    localStorage.setItem(key, JSON.stringify(transactions))
    console.log("[v0] Transaction saved:", transaction)
  } catch (error) {
    console.error("[v0] Error saving transaction:", error)
  }
}

export function getTransactions(address: string): Transaction[] {
  try {
    const key = getStorageKey(address)
    return JSON.parse(localStorage.getItem(key) || "[]")
  } catch (error) {
    console.error("[v0] Error loading transactions:", error)
    return []
  }
}

export function updateTransactionStatus(address: string, hash: string, status: "confirmed" | "failed") {
  try {
    const key = getStorageKey(address)
    const transactions = getTransactions(address)
    const updatedTransactions = transactions.map((tx) => (tx.hash === hash ? { ...tx, status } : tx))
    localStorage.setItem(key, JSON.stringify(updatedTransactions))
    console.log("[v0] Transaction status updated:", { hash, status })
  } catch (error) {
    console.error("[v0] Error updating transaction status:", error)
  }
}

export function hasUserEnteredRaffle(address: string, raffleId: number, roundId?: string): boolean {
  try {
    const transactions = getTransactions(address)

    // Filter for confirmed raffle entries for this specific raffle
    const entries = transactions.filter(
      (tx) => tx.type === "raffle_entry" && tx.status === "confirmed" && tx.raffleId === raffleId,
    )

    // If roundId is provided, check for that specific round
    if (roundId) {
      return entries.some((tx) => tx.roundId === roundId)
    }

    // Otherwise, check for entries in the last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    return entries.some((tx) => tx.timestamp >= oneDayAgo)
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
