"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { BackgroundEffects } from "@/components/background-effects"
import { Button } from "@/components/ui/button"
import { Trophy, Loader2, CheckCircle2 } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { drawWinner, getWinners, type Winner } from "@/lib/winner-selection"
import { WinnerAnnouncementModal } from "@/components/winner-announcement-modal"

const rafflesData = [
  { id: 1, title: "0.5 SOL", prize: "0.5" },
  { id: 2, title: "1 SOL", prize: "1" },
  { id: 3, title: "3 SOL", prize: "3" },
  { id: 4, title: "4 SOL", prize: "4" },
]

export default function AdminPage() {
  const { account, isConnected } = useWallet()
  const [winners, setWinners] = useState<Winner[]>([])
  const [isDrawing, setIsDrawing] = useState<number | null>(null)
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null)
  const [showWinnerModal, setShowWinnerModal] = useState(false)

  useEffect(() => {
    const loadedWinners = getWinners()
    setWinners(loadedWinners)
  }, [])

  const handleDrawWinner = async (raffleId: number, prizeAmount: string) => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    setIsDrawing(raffleId)

    try {
      const winner = await drawWinner(raffleId, prizeAmount)
      setWinners([...winners, winner])
      setSelectedWinner(winner)
      setShowWinnerModal(true)
      console.log("[v0] Winner drawn:", winner)
    } catch (error: any) {
      console.error("[v0] Error drawing winner:", error)
      alert(`Failed to draw winner: ${error.message}`)
    } finally {
      setIsDrawing(null)
    }
  }

  const getWinnerForRaffle = (raffleId: number) => {
    return winners.find((w) => w.raffleId === raffleId)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundEffects />
      <Navbar />

      {selectedWinner && (
        <WinnerAnnouncementModal
          isOpen={showWinnerModal}
          onClose={() => setShowWinnerModal(false)}
          winner={selectedWinner}
          isCurrentUser={account?.toLowerCase() === selectedWinner.address.toLowerCase()}
        />
      )}

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold text-[#F0C040] mb-2">Admin Panel</h1>
            <p className="text-white/60">Draw winners for active raffles</p>
          </div>

          <div className="space-y-4">
            {rafflesData.map((raffle) => {
              const winner = getWinnerForRaffle(raffle.id)
              const isDrawingThis = isDrawing === raffle.id

              return (
                <div
                  key={raffle.id}
                  className="bg-black/60 backdrop-blur-sm border border-[rgba(255,215,0,0.1)] rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-heading font-bold text-white mb-1">{raffle.title}</h3>
                      <p className="text-white/60 text-sm">Prize: {raffle.prize} SOL</p>
                      {winner && (
                        <div className="mt-2 text-sm">
                          <p className="text-green-400 font-semibold">Winner Selected</p>
                          <p className="text-white/60 font-mono text-xs">
                            {winner.address.slice(0, 6)}...{winner.address.slice(-4)}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleDrawWinner(raffle.id, raffle.prize)}
                      disabled={isDrawingThis || !!winner}
                      className={`${
                        winner
                          ? "bg-green-600 hover:bg-green-600"
                          : "bg-gradient-to-r from-[#FFD700] to-[#FFB800] hover:from-[#FFE55C] hover:to-[#FFD700]"
                      } text-black font-semibold`}
                    >
                      {isDrawingThis ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Drawing...
                        </>
                      ) : winner ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Winner Selected
                        </>
                      ) : (
                        <>
                          <Trophy className="w-4 h-4 mr-2" />
                          Draw Winner
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {winners.length > 0 && (
            <div className="mt-8 bg-black/60 backdrop-blur-sm border border-[rgba(255,215,0,0.1)] rounded-lg p-6">
              <h2 className="text-2xl font-heading font-bold text-white mb-4">All Winners</h2>
              <div className="space-y-3">
                {winners.map((winner, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-white font-semibold">Raffle #{winner.raffleId}</p>
                      <p className="text-white/60 font-mono text-xs">
                        {winner.address.slice(0, 10)}...{winner.address.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#14F195] font-bold">{winner.prizeAmount} SOL</p>
                      <p className="text-white/40 text-xs">{new Date(winner.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
