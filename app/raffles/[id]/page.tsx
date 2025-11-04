"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { BackgroundEffects } from "@/components/background-effects"
import { WinnersTicker } from "@/components/winners-ticker"
import { ProvablyFairModal } from "@/components/provably-fair-modal"
import { RulesModal } from "@/components/rules-modal"
import { RaffleToast } from "@/components/raffle-toast"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Minus, Plus, CheckCircle2, Loader2 } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { calculateTimeRemaining } from "@/lib/countdown-utils"
import { raffleContract } from "@/lib/raffle-contract"
import { saveTransaction, hasEnteredRaffle, type Transaction } from "@/lib/actions/transaction-actions"
import { getCurrentRound, updateRoundTicketCount, type RaffleRound } from "@/lib/actions/raffle-actions"

const rafflesData = [
  {
    id: "3",
    title: "3 SOL",
    price: "0.25 SOL",
    priceValue: 0.25,
    prize: "3 SOL",
    image: "/raffle-icon.png",
    totalTickets: 20,
    ticketsSold: 0,
    description: "Win 3 SOL! 20 Tickets available at 0.25 SOL Each. Enter now for your chance to win!",
    isLocked: false,
  },
  {
    id: "2",
    title: "1 SOL",
    price: "0.1 SOL",
    priceValue: 0.1,
    prize: "1 SOL",
    image: "/raffle-icon.png",
    totalTickets: 50,
    ticketsSold: 0,
    description: "Win 1 SOL! 50 Tickets available at 0.1 SOL Each. Enter now for your chance to win!",
    isLocked: false,
  },
  {
    id: "1",
    title: "0.5 SOL",
    price: "0.03 SOL",
    priceValue: 0.03,
    prize: "0.5 SOL",
    image: "/raffle-icon.png",
    totalTickets: 80,
    ticketsSold: 0,
    description: "Win 0.5 SOL! 80 Tickets available at 0.03 SOL Each. Enter now for your chance to win!",
    isLocked: false,
  },
  {
    id: "4",
    title: "4 SOL",
    price: "FREE",
    priceValue: 0,
    prize: "4 SOL",
    image: "/raffle-icon.png",
    totalTickets: 100,
    ticketsSold: 0,
    description: "Win 4 SOL! Completely FREE entry. One entry per wallet. 100 Tickets available!",
    isLocked: false,
  },
]

export default function RaffleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("recent")
  const [isProvablyFairOpen, setIsProvablyFairOpen] = useState(false)
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const { account, isConnected, connectWallet, transactionStatus, resetTransactionStatus, balance, refreshBalance } =
    useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "confirmed" | "failed">("idle")
  const [txHash, setTxHash] = useState<string>("")
  const [txError, setTxError] = useState<string>("")
  const [hasAlreadyEntered, setHasAlreadyEntered] = useState(false)
  const [isCheckingEntry, setIsCheckingEntry] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const raffle = rafflesData.find((r) => r.id === params.id) || rafflesData[0]

  const [currentRound, setCurrentRound] = useState<RaffleRound | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(0))
  const [ticketsSold, setTicketsSold] = useState(0)
  const [isLoadingRound, setIsLoadingRound] = useState(true)

  useEffect(() => {
    async function loadRound() {
      const result = await getCurrentRound(Number.parseInt(params.id as string))
      if (result.success && result.data) {
        setCurrentRound(result.data)
        setTicketsSold(result.data.total_tickets_sold || 0)
        setTimeRemaining(calculateTimeRemaining(result.data.end_time))
      } else {
        console.log("[v0] No active round found, raffle may have ended")
      }
      setIsLoadingRound(false)
    }

    loadRound()

    const roundRefreshInterval = setInterval(loadRound, 30000)

    return () => clearInterval(roundRefreshInterval)
  }, [params.id])

  useEffect(() => {
    if (!currentRound) return

    const interval = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining(currentRound.end_time)
      setTimeRemaining(newTimeRemaining)

      if (newTimeRemaining.isExpired && !timeRemaining.isExpired) {
        console.log("[v0] Raffle has just expired")
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentRound])

  useEffect(() => {
    return () => {
      resetTransactionStatus()
      setTxStatus("idle")
    }
  }, [params.id])

  useEffect(() => {
    async function checkUserEntry() {
      if (!isConnected || !account || raffle.id !== "4" || raffle.priceValue !== 0) {
        setHasAlreadyEntered(false)
        return
      }

      setIsCheckingEntry(true)
      try {
        if (currentRound?.id) {
          const result = await hasEnteredRaffle(account, Number.parseInt(raffle.id), currentRound.id)
          if (result.success) {
            setHasAlreadyEntered(result.hasEntered)
            console.log("[v0] User has already entered free raffle:", result.hasEntered)
          }
        }
      } catch (error) {
        console.log("[v0] Error checking user entry status:", error)
        setHasAlreadyEntered(false)
      } finally {
        setIsCheckingEntry(false)
      }
    }

    checkUserEntry()
  }, [isConnected, account, raffle.id, raffle.priceValue, currentRound?.id])

  const isSoldOut = !currentRound || ticketsSold >= raffle.totalTickets || timeRemaining.isExpired
  const ticketProgress = (ticketsSold / raffle.totalTickets) * 100

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, Math.min(quantity + delta, 10)))
  }

  const handleBuyTickets = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    if (isSoldOut || !currentRound) {
      return
    }

    if (raffle.priceValue === 0) {
      const result = await hasEnteredRaffle(account!, Number.parseInt(raffle.id), currentRound.id)
      if (result.success && (result.hasEntered || hasAlreadyEntered)) {
        setTxStatus("failed")
        setTxError("You have already entered this free raffle. Only one entry per wallet is allowed.")
        setHasAlreadyEntered(true)
        return
      }
    }

    setIsProcessing(true)
    setTxStatus("pending")
    setTxError("")

    try {
      const actualQuantity = raffle.priceValue === 0 ? 1 : quantity
      const amount = raffle.priceValue === 0 ? "0" : (raffle.priceValue * actualQuantity).toFixed(4)

      console.log("[v0] Initiating raffle entry:", {
        raffleId: params.id,
        roundId: currentRound.id,
        quantity: actualQuantity,
        amount,
        isFree: raffle.priceValue === 0,
      })

      try {
        await raffleContract.initialize()
      } catch (error) {
        console.log("[v0] Contract already initialized or using fallback mode")
      }

      let txHash: string
      try {
        txHash = await raffleContract.enterRaffle(Number.parseInt(params.id as string), actualQuantity)
        console.log("[v0] Raffle entry successful! Transaction hash:", txHash)
      } catch (contractError: any) {
        // Check if user rejected the transaction
        if (contractError.message?.includes("User rejected") || contractError.code === 4001) {
          throw new Error("Transaction cancelled by user")
        }
        // For any other error, throw it
        throw contractError
      }

      setTxHash(txHash)
      setTxStatus("confirmed")

      if (account) {
        const transaction: Transaction = {
          hash: txHash,
          type: "raffle_entry",
          raffleId: Number.parseInt(params.id as string),
          amount: amount,
          ticketCount: actualQuantity,
          timestamp: Date.now(),
          status: "confirmed",
          roundId: currentRound.id,
        }
        const result = await saveTransaction(account, transaction)
        if (result.success) {
          console.log("[v0] Transaction saved to Supabase successfully")

          setToastMessage(
            raffle.priceValue === 0
              ? "Successfully entered free raffle!"
              : `Successfully purchased ${actualQuantity} ticket${actualQuantity > 1 ? "s" : ""}!`,
          )
          setShowToast(true)
        } else {
          console.error("[v0] Failed to save transaction to Supabase:", result.error)
        }

        if (raffle.priceValue === 0) {
          setHasAlreadyEntered(true)
          console.log("[v0] Free raffle entry recorded, preventing duplicate entries")
        }
      }

      const newTicketsSold = Math.min(ticketsSold + actualQuantity, raffle.totalTickets)
      setTicketsSold(newTicketsSold)

      const updateResult = await updateRoundTicketCount(currentRound.id, newTicketsSold)
      if (updateResult.success) {
        console.log("[v0] Ticket count updated in database")
      } else {
        console.error("[v0] Failed to update ticket count in database")
      }

      await refreshBalance()

      console.log("[v0] Purchase complete:", { txHash, newTicketsSold })
    } catch (error: any) {
      console.error("[v0] Purchase failed:", error)
      setTxStatus("failed")

      if (error.message?.includes("cancelled by user") || error.message?.includes("User rejected")) {
        setTxError("Transaction cancelled. Please try again when ready.")
      } else if (error.message?.includes("Insufficient funds")) {
        setTxError("Insufficient SOL balance. Please add funds to your wallet.")
      } else {
        setTxError(error.message || "Transaction failed. Please try again.")
      }

      if (account && txHash) {
        const transaction: Transaction = {
          hash: txHash,
          type: "raffle_entry",
          raffleId: Number.parseInt(params.id as string),
          amount: raffle.priceValue === 0 ? "0" : (raffle.priceValue * quantity).toFixed(4),
          ticketCount: quantity,
          timestamp: Date.now(),
          status: "failed",
          roundId: currentRound?.id,
        }
        await saveTransaction(account, transaction)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const totalCost = raffle.priceValue * quantity
  const estimatedGas = 0.004
  const totalWithGas = totalCost + estimatedGas

  if (isLoadingRound) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <BackgroundEffects />
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <Clock className="w-16 h-16 text-[#9945ff] animate-spin mx-auto mb-4" />
            <p className="text-[#b8b8b8] font-heading">Loading raffle...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundEffects />
      <Navbar />

      <ProvablyFairModal isOpen={isProvablyFairOpen} onClose={() => setIsProvablyFairOpen(false)} />
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <RaffleToast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />

      <div className="pt-16 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#b8b8b8] hover:text-[#9945ff] transition-colors mb-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-heading text-sm font-bold">{raffle.price}</span>
          </button>

          <div className="grid lg:grid-cols-2 gap-4 items-start mb-4">
            <div className="relative aspect-square max-h-[450px] rounded-lg overflow-hidden bg-[#080808] border border-[#2b2b2b]">
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <CheckCircle2 className="w-16 h-16 text-[#9945ff] mx-auto" />
                    <div>
                      <p className="text-lg font-heading font-bold text-[#9945ff] mb-1">
                        {!currentRound ? "NO ACTIVE ROUND" : timeRemaining.isExpired ? "ENDED" : "SOLD OUT"}
                      </p>
                      <p className="text-sm text-[#b8b8b8]">
                        {!currentRound
                          ? "Waiting for next round to start"
                          : timeRemaining.isExpired
                            ? "This round has ended"
                            : "All tickets have been claimed"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <Image src="/raffle-prize.png" alt={raffle.title} fill className="object-cover scale-[1.25]" />
            </div>

            <div className="flex items-center justify-center h-full min-h-[450px]">
              <div className="bg-black/60 backdrop-blur-sm border-2 border-[rgba(153,69,255,0.2)] rounded-2xl p-8 w-full">
                <div className="text-center mb-6">
                  <Clock className="w-12 h-12 text-[#9945ff] mx-auto mb-3" />
                  <p className="text-sm text-[#b8b8b8] uppercase tracking-wider font-semibold">
                    {timeRemaining.isExpired ? "Raffle Ended" : "Time Remaining"}
                  </p>
                  {currentRound && <p className="text-xs text-[#777] mt-1">Round #{currentRound.round_number}</p>}
                </div>

                <div className="flex justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="bg-[#0a0a0a] border border-[rgba(153,69,255,0.3)] rounded-xl px-5 py-4 min-w-[90px]">
                      <p className="font-heading text-4xl font-bold text-[#9945ff]">
                        {String(timeRemaining.days || 0).padStart(2, "0")}
                      </p>
                    </div>
                    <p className="text-xs text-[#777] uppercase tracking-wide mt-2 font-semibold">Days</p>
                  </div>

                  <div className="flex items-center pb-6">
                    <span className="font-heading text-3xl font-bold text-[#9945ff]">:</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="bg-[#0a0a0a] border border-[rgba(153,69,255,0.3)] rounded-xl px-5 py-4 min-w-[90px]">
                      <p className="font-heading text-4xl font-bold text-[#9945ff]">
                        {String(timeRemaining.hours || 0).padStart(2, "0")}
                      </p>
                    </div>
                    <p className="text-xs text-[#777] uppercase tracking-wide mt-2 font-semibold">Hours</p>
                  </div>

                  <div className="flex items-center pb-6">
                    <span className="font-heading text-3xl font-bold text-[#9945ff]">:</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="bg-[#0a0a0a] border border-[rgba(153,69,255,0.3)] rounded-xl px-5 py-4 min-w-[90px]">
                      <p className="font-heading text-4xl font-bold text-[#9945ff]">
                        {String(timeRemaining.minutes || 0).padStart(2, "0")}
                      </p>
                    </div>
                    <p className="text-xs text-[#777] uppercase tracking-wide mt-2 font-semibold">Minutes</p>
                  </div>

                  <div className="flex items-center pb-6">
                    <span className="font-heading text-3xl font-bold text-[#9945ff]">:</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="bg-[#0a0a0a] border border-[rgba(153,69,255,0.3)] rounded-xl px-5 py-4 min-w-[90px]">
                      <p className="font-heading text-4xl font-bold text-[#9945ff]">
                        {String(timeRemaining.seconds || 0).padStart(2, "0")}
                      </p>
                    </div>
                    <p className="text-xs text-[#777] uppercase tracking-wide mt-2 font-semibold">Seconds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="bg-black/40 backdrop-blur-sm border border-[rgba(153,69,255,0.1)] rounded-lg p-3">
                <h3 className="font-heading text-sm font-bold text-[#9945ff] mb-2">{raffle.title}</h3>
                <p className="text-[10px] text-[#b8b8b8] leading-relaxed mb-2">{raffle.description}</p>
                <div className="flex items-center justify-between text-[9px] text-[#777] mb-2">
                  <span>Total Slots: {raffle.totalTickets}</span>
                  <span>Remaining: {raffle.totalTickets - ticketsSold}</span>
                </div>
                <div className="space-y-1">
                  <div className="w-full bg-[#0a0a0a] rounded-full h-2 border border-[rgba(153,69,255,0.2)] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#9945ff] to-[#7d2edb] transition-all duration-500 ease-out"
                      style={{ width: `${ticketProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-[#777]">
                    <span>{ticketsSold} sold</span>
                    <span>{ticketProgress.toFixed(1)}% filled</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-sm border border-[rgba(153,69,255,0.1)] rounded-lg p-2">
                <p className="text-[9px] text-[#777] uppercase tracking-wide mb-0.5">
                  {raffle.priceValue === 0 ? "Entry Fee" : "Ticket Price"}
                </p>
                <p className="font-heading text-lg font-bold text-[#9945ff]">{raffle.price}</p>
              </div>

              <div className="bg-black/60 backdrop-blur-sm border border-[rgba(153,69,255,0.1)] rounded-lg p-2">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[9px] text-[#777] uppercase tracking-wide">Prize</p>
                  <p className="font-heading text-sm font-bold text-[#9945ff]">{raffle.prize}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[9px] text-[#777] uppercase tracking-wide">Tickets</p>
                  <p className="font-heading text-sm font-bold text-foreground">
                    {ticketsSold} / {raffle.totalTickets}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setIsProvablyFairOpen(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs border-[rgba(153,69,255,0.2)] hover:border-[#9945ff] hover:bg-[rgba(153,69,255,0.1)] text-[#b8b8b8] hover:text-[#9945ff] bg-transparent h-9"
                >
                  Provably Fair
                </Button>
                <Button
                  onClick={() => setIsRulesOpen(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs border-[rgba(153,69,255,0.2)] hover:border-[#9945ff] hover:bg-[rgba(153,69,255,0.1)]"
                >
                  Rules
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-black/60 backdrop-blur-sm border border-[rgba(153,69,255,0.1)] rounded-lg p-2 space-y-1.5">
                {raffle.priceValue !== 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={isProcessing || txStatus === "pending" || isSoldOut}
                      className="h-7 w-7 border-[rgba(153,69,255,0.2)] hover:border-[#9945ff] hover:bg-[rgba(153,69,255,0.1)]"
                    >
                      <Minus className="w-3 h-3 text-[#9945ff]" />
                    </Button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                      disabled={isProcessing || txStatus === "pending" || isSoldOut}
                      className="flex-1 bg-[#0a0a0a] border border-[rgba(153,69,255,0.2)] rounded-lg px-2 py-1 text-center font-heading text-sm font-bold text-foreground focus:outline-none focus:border-[#9945ff] disabled:opacity-50"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={isProcessing || txStatus === "pending" || isSoldOut}
                      className="h-7 w-7 border-[rgba(153,69,255,0.2)] hover:border-[#9945ff] hover:bg-[rgba(153,69,255,0.1)]"
                    >
                      <Plus className="w-3 h-3 text-[#9945ff]" />
                    </Button>
                  </div>
                )}

                <Button
                  onClick={handleBuyTickets}
                  disabled={
                    isProcessing ||
                    txStatus === "pending" ||
                    isSoldOut ||
                    (raffle.priceValue === 0 && hasAlreadyEntered) ||
                    isCheckingEntry
                  }
                  className="w-full h-8 rounded-lg font-semibold text-[10px] uppercase transition-all hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background:
                      isSoldOut || (raffle.priceValue === 0 && hasAlreadyEntered)
                        ? "#555"
                        : "linear-gradient(90deg, #9945ff, #7d2edb)",
                    color: "#ffffff",
                    boxShadow:
                      isSoldOut || (raffle.priceValue === 0 && hasAlreadyEntered)
                        ? "none"
                        : "0 0 10px rgba(153,69,255,0.25)",
                  }}
                >
                  {isCheckingEntry ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      Checking...
                    </>
                  ) : isSoldOut ? (
                    "SOLD OUT"
                  ) : raffle.priceValue === 0 && hasAlreadyEntered ? (
                    "ALREADY ENTERED"
                  ) : !isConnected ? (
                    "Connect Wallet"
                  ) : txStatus === "pending" ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      Processing...
                    </>
                  ) : txStatus === "confirmed" ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 mr-1.5" />
                      Success!
                    </>
                  ) : raffle.priceValue === 0 ? (
                    "Enter Free Raffle"
                  ) : (
                    `Buy ${quantity} Ticket${quantity > 1 ? "s" : ""}`
                  )}
                </Button>

                {raffle.priceValue === 0 && hasAlreadyEntered && txStatus === "idle" && (
                  <div className="text-[9px] text-[#9945ff] text-center">
                    <p>You have already entered this free raffle</p>
                    <p>Only one entry per wallet is allowed</p>
                  </div>
                )}

                {!isConnected && !isSoldOut && (
                  <p className="text-[9px] text-[#777] text-center">
                    {raffle.priceValue === 0
                      ? "Connect your wallet to enter for free"
                      : "Connect your wallet to purchase tickets"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <WinnersTicker />
    </main>
  )
}
