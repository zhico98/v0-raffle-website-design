import { ethers } from "ethers"
import { web3Provider } from "./web3-provider"
import { RAFFLE_CONTRACT, RAFFLE_ABI } from "./blockchain-config"

export interface RaffleInfo {
  id: number
  totalTickets: number
  prizePool: string
  winner: string | null
  isActive: boolean
  endTime: number
}

export interface UserRaffleStats {
  ticketsPurchased: number
  totalSpent: string
  rafflesEntered: number
  rafflesWon: number
  totalWinnings: string
}

export class RaffleContract {
  private contract: ethers.Contract | null = null

  async initialize() {
    try {
      await web3Provider.initialize()
      const signer = web3Provider.getSigner()

      this.contract = new ethers.Contract(RAFFLE_CONTRACT.address, RAFFLE_ABI, signer)

      console.log("[v0] Raffle contract initialized at:", RAFFLE_CONTRACT.address)
      return this
    } catch (error) {
      console.error("[v0] Error initializing raffle contract:", error)
      throw error
    }
  }

  async enterRaffle(raffleId: number, ticketCount: number): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const ticketPrice = ethers.parseEther(RAFFLE_CONTRACT.ticketPrice)
      const totalCost = ticketPrice * BigInt(ticketCount)

      console.log("[v0] Entering raffle:", { raffleId, ticketCount, totalCost: ethers.formatEther(totalCost) })

      const tx = await this.contract.enterRaffle(raffleId, ticketCount, {
        value: totalCost,
      })

      console.log("[v0] Transaction sent:", tx.hash)

      const receipt = await tx.wait()
      console.log("[v0] Transaction confirmed:", receipt.hash)

      return receipt.hash
    } catch (error: any) {
      console.error("[v0] Error entering raffle:", error)
      throw new Error(error.message || "Failed to enter raffle")
    }
  }

  async getRaffleInfo(raffleId: number): Promise<RaffleInfo> {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const info = await this.contract.getRaffleInfo(raffleId)

      return {
        id: raffleId,
        totalTickets: Number(info.totalTickets),
        prizePool: ethers.formatEther(info.prizePool),
        winner: info.winner === ethers.ZeroAddress ? null : info.winner,
        isActive: info.isActive,
        endTime: Date.now() + 24 * 60 * 60 * 1000, // Mock end time for now
      }
    } catch (error) {
      console.error("[v0] Error getting raffle info:", error)
      // Return mock data if contract call fails
      return {
        id: raffleId,
        totalTickets: 0,
        prizePool: "0",
        winner: null,
        isActive: true,
        endTime: Date.now() + 24 * 60 * 60 * 1000,
      }
    }
  }

  async getUserTickets(raffleId: number, userAddress: string): Promise<number> {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const tickets = await this.contract.getUserTickets(raffleId, userAddress)
      return Number(tickets)
    } catch (error) {
      console.error("[v0] Error getting user tickets:", error)
      return 0
    }
  }

  async getUserStats(userAddress: string): Promise<UserRaffleStats> {
    // This would typically aggregate data from multiple contract calls or events
    // For now, we'll return mock data structure
    try {
      // In a real implementation, you would:
      // 1. Query past events for this user
      // 2. Calculate total tickets purchased
      // 3. Calculate total spent
      // 4. Check for wins

      return {
        ticketsPurchased: 0,
        totalSpent: "0",
        rafflesEntered: 0,
        rafflesWon: 0,
        totalWinnings: "0",
      }
    } catch (error) {
      console.error("[v0] Error getting user stats:", error)
      return {
        ticketsPurchased: 0,
        totalSpent: "0",
        rafflesEntered: 0,
        rafflesWon: 0,
        totalWinnings: "0",
      }
    }
  }

  async drawWinner(raffleId: number): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      console.log("[v0] Drawing winner for raffle:", raffleId)

      const tx = await this.contract.drawWinner(raffleId)
      const receipt = await tx.wait()

      // Parse the WinnerDrawn event to get the winner address
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log)
          return parsed?.name === "WinnerDrawn"
        } catch {
          return false
        }
      })

      if (event) {
        const parsed = this.contract.interface.parseLog(event)
        const winnerAddress = parsed?.args[1] // winner is the second argument
        console.log("[v0] Winner drawn:", winnerAddress)
        return winnerAddress
      }

      throw new Error("Winner event not found")
    } catch (error: any) {
      console.error("[v0] Error drawing winner:", error)
      throw new Error(error.message || "Failed to draw winner")
    }
  }

  // Listen to contract events
  onRaffleEntered(callback: (raffleId: number, user: string, ticketCount: number) => void) {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    this.contract.on("RaffleEntered", (raffleId, user, ticketCount) => {
      console.log("[v0] RaffleEntered event:", { raffleId, user, ticketCount })
      callback(Number(raffleId), user, Number(ticketCount))
    })
  }

  onWinnerDrawn(callback: (raffleId: number, winner: string, prizeAmount: string) => void) {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    this.contract.on("WinnerDrawn", (raffleId, winner, prizeAmount) => {
      console.log("[v0] WinnerDrawn event:", { raffleId, winner, prizeAmount })
      callback(Number(raffleId), winner, ethers.formatEther(prizeAmount))
    })
  }
}

export const raffleContract = new RaffleContract()
