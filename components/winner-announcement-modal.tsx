"use client"

import { useEffect, useState } from "react"
import { Trophy, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Winner } from "@/lib/winner-selection"

interface WinnerAnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
  winner: Winner
  isCurrentUser: boolean
}

export function WinnerAnnouncementModal({ isOpen, onClose, winner, isCurrentUser }: WinnerAnnouncementModalProps) {
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setConfetti(true)
      setTimeout(() => setConfetti(false), 5000)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      {confetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#F0C040] rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-md bg-[#0a0a0a] border-2 border-[#F0C040] rounded-2xl p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>

        <div className="text-center space-y-6">
          <div className="relative">
            <Trophy className="w-24 h-24 text-[#F0C040] mx-auto animate-bounce" />
            <div className="absolute inset-0 bg-[#F0C040] blur-3xl opacity-20 animate-pulse" />
          </div>

          <div>
            <h2 className="text-3xl font-heading font-bold text-[#F0C040] mb-2">
              {isCurrentUser ? "Congratulations!" : "Winner Announced!"}
            </h2>
            <p className="text-white/60 text-sm">{isCurrentUser ? "You won the raffle!" : "The raffle has ended"}</p>
          </div>

          <div className="bg-black/60 border border-[rgba(255,215,0,0.2)] rounded-lg p-6 space-y-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Winner Address</p>
              <p className="text-white font-mono text-xs break-all">
                {winner.address.slice(0, 6)}...{winner.address.slice(-4)}
              </p>
            </div>

            <div>
              <p className="text-white/60 text-sm mb-1">Prize Amount</p>
              <p className="text-3xl font-heading font-bold text-[#14F195]">{winner.prizeAmount} SOL</p>
            </div>

            <div>
              <p className="text-white/60 text-sm mb-1">Raffle ID</p>
              <p className="text-white font-semibold">#{winner.raffleId}</p>
            </div>
          </div>

          {isCurrentUser && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-sm font-semibold mb-2">Prize will be sent to your wallet</p>
              <p className="text-green-400/60 text-xs">
                The prize will be automatically transferred to your connected wallet address within 24 hours.
              </p>
            </div>
          )}

          {winner.txHash && (
            <a
              href={`https://solscan.io/tx/${winner.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-[#14F195] hover:text-[#9945FF] transition-colors text-sm"
            >
              View Transaction on Solscan
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFB800] hover:from-[#FFE55C] hover:to-[#FFD700] text-black font-semibold"
          >
            {isCurrentUser ? "Claim Prize" : "Close"}
          </Button>
        </div>
      </div>
    </div>
  )
}
