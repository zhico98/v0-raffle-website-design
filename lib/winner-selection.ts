import { raffleContract } from "./raffle-contract"
import { saveTransaction, type Transaction } from "./transaction-storage"

export interface Winner {
  address: string
  raffleId: number
  prizeAmount: string
  timestamp: number
  txHash: string
}

const WINNERS_STORAGE_KEY = "lotta_gg_winners"

export function saveWinner(winner: Winner) {
  try {
    const winners = JSON.parse(localStorage.getItem(WINNERS_STORAGE_KEY) || "[]")
    winners.push(winner)
    localStorage.setItem(WINNERS_STORAGE_KEY, JSON.stringify(winners))
    console.log("[v0] Winner saved:", winner)
  } catch (error) {
    console.error("[v0] Error saving winner:", error)
  }
}

export function getWinners(): Winner[] {
  try {
    return JSON.parse(localStorage.getItem(WINNERS_STORAGE_KEY) || "[]")
  } catch (error) {
    console.error("[v0] Error loading winners:", error)
    return []
  }
}

export function getWinnerByRaffle(raffleId: number): Winner | null {
  const winners = getWinners()
  return winners.find((w) => w.raffleId === raffleId) || null
}

export function isUserWinner(address: string, raffleId: number): boolean {
  const winner = getWinnerByRaffle(raffleId)
  return winner?.address.toLowerCase() === address.toLowerCase()
}

export async function drawWinner(raffleId: number, prizeAmount: string): Promise<Winner> {
  try {
    console.log("[v0] Drawing winner for raffle:", raffleId)

    // Initialize contract
    await raffleContract.initialize()

    // Call smart contract to draw winner
    const winnerAddress = await raffleContract.drawWinner(raffleId)

    const winner: Winner = {
      address: winnerAddress,
      raffleId,
      prizeAmount,
      timestamp: Date.now(),
      txHash: "", // Will be set by the transaction
    }

    saveWinner(winner)

    console.log("[v0] Winner drawn successfully:", winner)
    return winner
  } catch (error: any) {
    console.error("[v0] Error drawing winner:", error)
    throw new Error(error.message || "Failed to draw winner")
  }
}

export async function claimPrize(raffleId: number, winnerAddress: string, prizeAmount: string): Promise<string> {
  try {
    console.log("[v0] Claiming prize for raffle:", raffleId)

    // In a real implementation, this would call a smart contract function
    // For now, we'll simulate the prize claim

    // Create a transaction record
    const transaction: Transaction = {
      hash: `0x${Math.random().toString(16).substring(2)}`, // Mock transaction hash
      type: "prize_claim",
      raffleId,
      amount: prizeAmount,
      timestamp: Date.now(),
      status: "confirmed",
    }

    saveTransaction(winnerAddress, transaction)

    console.log("[v0] Prize claimed successfully")
    return transaction.hash
  } catch (error: any) {
    console.error("[v0] Error claiming prize:", error)
    throw new Error(error.message || "Failed to claim prize")
  }
}

// Automatic winner selection when raffle ends
export function setupAutomaticWinnerSelection(raffleId: number, endTime: number, prizeAmount: string) {
  const timeUntilEnd = endTime - Date.now()

  if (timeUntilEnd > 0) {
    console.log("[v0] Setting up automatic winner selection for raffle:", raffleId, "in", timeUntilEnd, "ms")

    setTimeout(async () => {
      try {
        // Check if winner already exists
        const existingWinner = getWinnerByRaffle(raffleId)
        if (existingWinner) {
          console.log("[v0] Winner already selected for raffle:", raffleId)
          return
        }

        // Draw winner
        await drawWinner(raffleId, prizeAmount)
        console.log("[v0] Automatic winner selection completed for raffle:", raffleId)
      } catch (error) {
        console.error("[v0] Error in automatic winner selection:", error)
      }
    }, timeUntilEnd)
  }
}
