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

const ROUNDS_STORAGE_KEY = "lotta_gg_raffle_rounds"

function getRounds(): RaffleRound[] {
  try {
    const stored = localStorage.getItem(ROUNDS_STORAGE_KEY)
    if (!stored) {
      // Initialize with default rounds if none exist
      const defaultRounds = initializeDefaultRounds()
      localStorage.setItem(ROUNDS_STORAGE_KEY, JSON.stringify(defaultRounds))
      return defaultRounds
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error("[v0] Error loading rounds:", error)
    return initializeDefaultRounds()
  }
}

function saveRounds(rounds: RaffleRound[]) {
  try {
    localStorage.setItem(ROUNDS_STORAGE_KEY, JSON.stringify(rounds))
  } catch (error) {
    console.error("[v0] Error saving rounds:", error)
  }
}

function initializeDefaultRounds(): RaffleRound[] {
  const now = new Date()
  const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  return ["1", "2", "3", "4"].map((id) => ({
    id: `round-${id}-${Date.now()}`,
    raffle_id: id,
    round_number: 1,
    start_time: now.toISOString(),
    end_time: endTime.toISOString(),
    status: "active" as const,
    winner_address: null,
    total_tickets_sold: 0,
    total_prize_pool: 0,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }))
}

export async function getCurrentRound(raffleId: string): Promise<RaffleRound | null> {
  try {
    const rounds = getRounds()
    const activeRound = rounds.find((r) => r.raffle_id === raffleId && r.status === "active")

    // Check if round has expired
    const now = new Date()

    if (activeRound) {
      const endTime = new Date(activeRound.end_time)

      if (now > endTime) {
        console.log("[v0] Round expired for raffle:", raffleId)
        activeRound.status = "ended"

        // Get the next round number
        const allRaffleRounds = rounds.filter((r) => r.raffle_id === raffleId)
        const maxRoundNumber = Math.max(...allRaffleRounds.map((r) => r.round_number), 0)

        // Create new 24-hour round
        const newRound = await createNewRound(raffleId, maxRoundNumber + 1)
        saveRounds(rounds)

        console.log("[v0] Auto-created new round:", newRound)
        return newRound
      }
    } else {
      console.log("[v0] No active round found, creating new round for raffle:", raffleId)
      const allRaffleRounds = rounds.filter((r) => r.raffle_id === raffleId)
      const maxRoundNumber = Math.max(...allRaffleRounds.map((r) => r.round_number), 0)

      const newRound = await createNewRound(raffleId, maxRoundNumber + 1)
      return newRound
    }

    return activeRound
  } catch (error) {
    console.error("[v0] Error fetching current round:", error)
    return null
  }
}

export async function getAllActiveRounds(): Promise<RaffleRound[]> {
  try {
    const rounds = getRounds()
    const now = new Date()
    let hasChanges = false

    const raffleIds = ["1", "2", "3", "4"]

    for (const raffleId of raffleIds) {
      const activeRound = rounds.find((r) => r.raffle_id === raffleId && r.status === "active")

      if (activeRound) {
        const endTime = new Date(activeRound.end_time)
        if (now > endTime) {
          // Mark as ended
          activeRound.status = "ended"
          hasChanges = true

          // Create new round
          const allRaffleRounds = rounds.filter((r) => r.raffle_id === raffleId)
          const maxRoundNumber = Math.max(...allRaffleRounds.map((r) => r.round_number), 0)
          await createNewRound(raffleId, maxRoundNumber + 1)

          console.log("[v0] Auto-renewed round for raffle:", raffleId)
        }
      } else {
        // No active round, create one
        const allRaffleRounds = rounds.filter((r) => r.raffle_id === raffleId)
        const maxRoundNumber = Math.max(...allRaffleRounds.map((r) => r.round_number), 0)
        await createNewRound(raffleId, maxRoundNumber + 1)
        hasChanges = true

        console.log("[v0] Created missing round for raffle:", raffleId)
      }
    }

    if (hasChanges) {
      saveRounds(rounds)
    }

    // Return all active rounds
    const updatedRounds = getRounds()
    return updatedRounds.filter((r) => r.status === "active")
  } catch (error) {
    console.error("[v0] Error fetching active rounds:", error)
    return []
  }
}

export async function createNewRound(raffleId: string, roundNumber: number): Promise<RaffleRound | null> {
  try {
    const rounds = getRounds()
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000)

    const newRound: RaffleRound = {
      id: `round-${raffleId}-${Date.now()}`,
      raffle_id: raffleId,
      round_number: roundNumber,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "active",
      winner_address: null,
      total_tickets_sold: 0,
      total_prize_pool: 0,
      created_at: startTime.toISOString(),
      updated_at: startTime.toISOString(),
    }

    rounds.push(newRound)
    saveRounds(rounds)

    console.log("[v0] New round created:", newRound)
    return newRound
  } catch (error) {
    console.error("[v0] Error creating new round:", error)
    return null
  }
}

export async function updateRoundStatus(
  roundId: string,
  status: "active" | "ended" | "drawn",
  winnerAddress?: string,
): Promise<boolean> {
  try {
    const rounds = getRounds()
    const round = rounds.find((r) => r.id === roundId)

    if (!round) {
      console.error("[v0] Round not found:", roundId)
      return false
    }

    round.status = status
    if (winnerAddress) {
      round.winner_address = winnerAddress
    }
    round.updated_at = new Date().toISOString()

    saveRounds(rounds)
    console.log("[v0] Round status updated:", { roundId, status })
    return true
  } catch (error) {
    console.error("[v0] Error updating round status:", error)
    return false
  }
}

export async function updateRoundTickets(roundId: string, ticketCount: number, prizeAmount: number): Promise<boolean> {
  try {
    const rounds = getRounds()
    const round = rounds.find((r) => r.id === roundId)

    if (!round) {
      console.error("[v0] Round not found:", roundId)
      return false
    }

    round.total_tickets_sold = ticketCount
    round.total_prize_pool = prizeAmount
    round.updated_at = new Date().toISOString()

    saveRounds(rounds)
    return true
  } catch (error) {
    console.error("[v0] Error updating round tickets:", error)
    return false
  }
}

export async function checkExpiredRounds(): Promise<RaffleRound[]> {
  try {
    const rounds = getRounds()
    const now = new Date()

    const expiredRounds = rounds.filter((r) => {
      if (r.status !== "active") return false
      const endTime = new Date(r.end_time)
      return now > endTime
    })

    return expiredRounds
  } catch (error) {
    console.error("[v0] Error checking expired rounds:", error)
    return []
  }
}

export async function getRoundHistory(raffleId: string, limit = 10): Promise<RaffleRound[]> {
  try {
    const rounds = getRounds()
    return rounds
      .filter((r) => r.raffle_id === raffleId)
      .sort((a, b) => b.round_number - a.round_number)
      .slice(0, limit)
  } catch (error) {
    console.error("[v0] Error fetching round history:", error)
    return []
  }
}
