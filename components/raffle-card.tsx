"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { calculateTimeRemaining } from "@/lib/countdown-utils"
import { getCurrentRound, type RaffleRound } from "@/lib/actions/raffle-actions"

interface RaffleCardProps {
  raffle: {
    id: number
    title: string
    image: string
    price: string
    prize?: string
    ticketsSold: number
    totalTickets: number
    endsIn?: {
      days: number
      hours: number
      minutes: number
    }
    isLocked?: boolean
    unlockFee?: string
  }
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  const [currentRound, setCurrentRound] = useState<RaffleRound | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(0))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadRound() {
      const result = await getCurrentRound(raffle.id)
      if (result.success && result.data) {
        setCurrentRound(result.data)
        setTimeRemaining(calculateTimeRemaining(result.data.end_time))
      }
      setIsLoading(false)
    }

    loadRound()

    const refreshInterval = setInterval(loadRound, 5 * 60 * 1000)

    return () => clearInterval(refreshInterval)
  }, [raffle.id])

  useEffect(() => {
    if (!currentRound) return

    const interval = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining(currentRound.end_time)
      setTimeRemaining(newTimeRemaining)

      if (newTimeRemaining.isExpired && !timeRemaining.isExpired) {
        getCurrentRound(raffle.id).then((result) => {
          if (result.success && result.data) {
            setCurrentRound(result.data)
          }
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentRound, raffle.id, timeRemaining.isExpired])

  const ticketsSold = currentRound?.total_tickets_sold || raffle.ticketsSold
  const percentage = (ticketsSold / raffle.totalTickets) * 100
  const isSoldOut = ticketsSold >= raffle.totalTickets || timeRemaining.isExpired

  if (isLoading) {
    return (
      <Card className="group relative overflow-hidden bg-[#080808] border border-[#2b2b2b] rounded-xl h-[480px] animate-pulse">
        <div className="h-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-[#F0C040] animate-spin" />
        </div>
      </Card>
    )
  }

  return (
    <Link href={`/raffles/${raffle.id}`} className="block">
      <Card className="group relative overflow-hidden bg-[#080808] border border-[#2b2b2b] rounded-xl hover:border-[#f5d36c]/50 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,211,108,0.15)] transition-all duration-300">
        <div className="relative h-[340px] -mt-6 overflow-hidden rounded-xl">
          <Image
            src={raffle.image || "/placeholder.svg"}
            alt={raffle.title}
            fill
            className="object-cover object-center scale-[1.25] transition-transform duration-500 group-hover:scale-[1.28]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />

          <div className="absolute top-9 right-3 bg-black/70 backdrop-blur-sm border border-[#1c1c1c] rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#F0C040]" />
            <span className="text-xs font-heading font-semibold text-foreground">
              {timeRemaining.isExpired
                ? "Ended"
                : `${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`}
            </span>
          </div>

          {isSoldOut && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-[#F0C040] text-black font-heading font-bold text-lg px-6 py-2 rounded-lg">
                {timeRemaining.isExpired ? "ENDED" : "SOLD OUT"}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-heading font-semibold text-base text-[#F0C040]">{raffle.title}</h3>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#b8b8b8]">
              <span>
                {ticketsSold} / {raffle.totalTickets} tickets
              </span>
              <span className="text-[#F0C040] font-semibold">{percentage.toFixed(0)}%</span>
            </div>
            <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FFD95E] to-[#FFB800] rounded-full"
                style={{
                  width: `${percentage}%`,
                  transition: "width 0.5s ease-out",
                }}
              />
            </div>
          </div>

          <div className="flex items-end justify-between pt-2">
            <div>
              <p className="text-xs text-[#777] uppercase tracking-wide mb-1">Entry</p>
              <p className="font-heading text-xl font-bold text-[#F0C040]">{raffle.price}</p>
            </div>
            <Button
              disabled={isSoldOut}
              className="h-8 px-4 rounded-lg font-semibold text-xs uppercase transition-all hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isSoldOut ? "#555" : "linear-gradient(90deg, #FFD700, #FFB800)",
                color: isSoldOut ? "#999" : "#000",
                boxShadow: isSoldOut ? "none" : "0 0 10px rgba(255,215,0,0.25)",
              }}
              onMouseEnter={(e) => {
                if (!isSoldOut) {
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.4)"
                }
              }}
              onMouseLeave={(e) => {
                if (!isSoldOut) {
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.25)"
                }
              }}
            >
              {isSoldOut ? "Sold Out" : "Enter Now"}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
}
