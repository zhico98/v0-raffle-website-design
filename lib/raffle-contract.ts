import { ethers } from "ethers"
import { web3Provider } from "./web3-provider"
import { RAFFLE_CONTRACT, RAFFLE_ABI } from "./blockchain-config"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

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
  private initialized = false
  private solanaConnection: Connection | null = null

  private getSolanaRpcEndpoint(): string {
    const envRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL

    // Validate that the environment variable is a valid HTTP/HTTPS URL
    if (envRpcUrl && (envRpcUrl.startsWith("http://") || envRpcUrl.startsWith("https://"))) {
      return envRpcUrl
    }

    // Default to devnet if env var is not set or invalid
    return "https://api.devnet.solana.com"
  }

  private getSolanaConnection(): Connection {
    if (!this.solanaConnection) {
      const endpoint = this.getSolanaRpcEndpoint()
      console.log("[v0] Creating Solana connection with RPC endpoint:", endpoint)
      this.solanaConnection = new Connection(endpoint, "confirmed")
    }
    return this.solanaConnection
  }

  async initialize() {
    try {
      if (typeof (window as any).phantom?.solana !== "undefined") {
        console.log("[v0] Raffle contract initialized for Solana")
        this.initialized = true
      } else {
        await web3Provider.initialize()
        const signer = web3Provider.getSigner()

        this.contract = new ethers.Contract(RAFFLE_CONTRACT.address, RAFFLE_ABI, signer)

        console.log("[v0] Raffle contract initialized at:", RAFFLE_CONTRACT.address)
      }
      return this
    } catch (error) {
      console.error("[v0] Error initializing raffle contract:", error)
      throw error
    }
  }

  async enterRaffle(raffleId: number, ticketCount: number): Promise<string> {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      if (typeof (window as any).phantom?.solana !== "undefined") {
        // Get Phantom provider
        const provider = (window as any).phantom?.solana

        console.log("[v0] Phantom provider:", provider)
        console.log("[v0] Phantom connected:", provider?.isConnected)
        console.log("[v0] Phantom publicKey:", provider?.publicKey?.toString())

        if (!provider || !provider.isConnected) {
          throw new Error("Phantom wallet not connected. Please connect your wallet first.")
        }

        const RAFFLE_ADDRESS = "HvoGuvTAXb1sAD47nFkNAqcWT7EvDFZkrZum22u89EW8"

        // Calculate ticket price based on raffle ID
        const ticketPrices: { [key: number]: number } = {
          1: 0.03, // 0.5 SOL raffle
          2: 0.1, // 1 SOL raffle
          3: 0.25, // 3 SOL raffle
          4: 0, // Free raffle
        }

        const ticketPrice = ticketPrices[raffleId] || 0.1
        const totalCost = ticketPrice * ticketCount

        console.log("[v0] Entering raffle:", { raffleId, ticketCount, totalCost, recipient: RAFFLE_ADDRESS })

        // If free raffle, just return a mock transaction
        if (totalCost === 0) {
          console.log("[v0] Free raffle entry, no transaction needed")
          return `free_entry_${Date.now()}_${Math.random().toString(36).substring(7)}`
        }

        // Convert SOL to lamports
        const lamports = Math.floor(totalCost * LAMPORTS_PER_SOL)
        console.log("[v0] Lamports to send:", lamports)

        const connection = this.getSolanaConnection()

        // Create transaction
        console.log("[v0] Creating transaction...")
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: new PublicKey(RAFFLE_ADDRESS),
            lamports,
          }),
        )

        console.log("[v0] Getting recent blockhash...")
        const { blockhash } = await connection.getLatestBlockhash("finalized")
        transaction.recentBlockhash = blockhash
        transaction.feePayer = provider.publicKey

        console.log("[v0] Transaction created, requesting signature from Phantom...")
        // Sign and send transaction
        const signed = await provider.signAndSendTransaction(transaction)
        const txHash = signed.signature

        console.log("[v0] Transaction sent:", txHash)

        console.log("[v0] Waiting for confirmation...")
        await connection.confirmTransaction(txHash, "confirmed")

        console.log("[v0] Transaction confirmed:", txHash)

        return txHash
      } else {
        if (!this.contract) {
          throw new Error("Contract not initialized")
        }

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
      }
    } catch (error: any) {
      console.error("[v0] Error entering raffle:", error)
      console.error("[v0] Error details:", error.message)

      if (error.message?.includes("403") || error.message?.includes("Access forbidden")) {
        throw new Error("Unable to connect to Solana network. Please try again later.")
      } else if (error.message?.includes("User rejected") || error.code === 4001) {
        throw new Error("Transaction was rejected by user")
      } else if (error.message?.includes("not connected")) {
        throw new Error("Phantom wallet not connected. Please connect your wallet first.")
      } else {
        throw new Error(error.message || "Failed to enter raffle")
      }
    }
  }

  async getRaffleInfo(raffleId: number): Promise<RaffleInfo> {
    if (!this.initialized) {
      throw new Error("Contract not initialized")
    }

    try {
      if (typeof (window as any).phantom?.solana !== "undefined") {
        // Return mock data for now
        return {
          id: raffleId,
          totalTickets: 0,
          prizePool: "0",
          winner: null,
          isActive: true,
          endTime: Date.now() + 24 * 60 * 60 * 1000,
        }
      } else {
        const info = await this.contract.getRaffleInfo(raffleId)

        return {
          id: raffleId,
          totalTickets: Number(info.totalTickets),
          prizePool: ethers.formatEther(info.prizePool),
          winner: info.winner === ethers.ZeroAddress ? null : info.winner,
          isActive: info.isActive,
          endTime: Date.now() + 24 * 60 * 60 * 1000, // Mock end time for now
        }
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
    if (!this.initialized) {
      throw new Error("Contract not initialized")
    }

    try {
      if (typeof (window as any).phantom?.solana !== "undefined") {
        return 0
      } else {
        const tickets = await this.contract.getUserTickets(raffleId, userAddress)
        return Number(tickets)
      }
    } catch (error) {
      console.error("[v0] Error getting user tickets:", error)
      return 0
    }
  }

  async getUserStats(userAddress: string): Promise<UserRaffleStats> {
    if (!this.initialized) {
      throw new Error("Contract not initialized")
    }

    try {
      if (typeof (window as any).phantom?.solana !== "undefined") {
        return {
          ticketsPurchased: 0,
          totalSpent: "0",
          rafflesEntered: 0,
          rafflesWon: 0,
          totalWinnings: "0",
        }
      } else {
        // This would typically aggregate data from multiple contract calls or events
        // For now, we'll return mock data structure
        return {
          ticketsPurchased: 0,
          totalSpent: "0",
          rafflesEntered: 0,
          rafflesWon: 0,
          totalWinnings: "0",
        }
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
    if (!this.initialized) {
      throw new Error("Contract not initialized")
    }

    try {
      if (typeof (window as any).phantom?.solana !== "undefined") {
        throw new Error("Draw winner not implemented for Solana yet")
      } else {
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
      }
    } catch (error: any) {
      console.error("[v0] Error drawing winner:", error)
      throw new Error(error.message || "Failed to draw winner")
    }
  }

  // Listen to contract events
  onRaffleEntered(callback: (raffleId: number, user: string, ticketCount: number) => void) {
    if (!this.initialized) {
      throw new Error("Contract not initialized")
    }

    try {
      if (typeof (window as any).phantom?.solana !== "undefined") {
        console.log("[v0] Event listeners not implemented for Solana yet")
      } else {
        this.contract.on("RaffleEntered", (raffleId, user, ticketCount) => {
          console.log("[v0] RaffleEntered event:", { raffleId, user, ticketCount })
          callback(Number(raffleId), user, Number(ticketCount))
        })
      }
    } catch (error) {
      console.error("[v0] Error setting up event listener:", error)
    }
  }

  onWinnerDrawn(callback: (raffleId: number, winner: string, prizeAmount: string) => void) {
    if (!this.initialized) {
      throw new Error("Contract not initialized")
    }

    try {
      if (typeof (window as any).phantom?.solana !== "undefined") {
        console.log("[v0] Event listeners not implemented for Solana yet")
      } else {
        this.contract.on("WinnerDrawn", (raffleId, winner, prizeAmount) => {
          console.log("[v0] WinnerDrawn event:", { raffleId, winner, prizeAmount })
          callback(Number(raffleId), winner, ethers.formatEther(prizeAmount))
        })
      }
    } catch (error) {
      console.error("[v0] Error setting up event listener:", error)
    }
  }
}

export const raffleContract = new RaffleContract()
