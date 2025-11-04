"use client"

import { RaffleCard } from "@/components/raffle-card"
import { useState, useEffect } from "react"
import { getAllActiveRounds } from "@/lib/raffle-rounds"

const raffles = [
  {
    id: 3,
    title: "3 SOL",
    image: "/raffle-icon.png",
    price: "0.25 SOL",
    prize: "3 SOL",
    ticketsSold: 0,
    totalTickets: 20,
    endsIn: { days: 0, hours: 23, minutes: 47 },
    isLocked: false,
  },
  {
    id: 2,
    title: "1 SOL",
    image: "/raffle-icon.png",
    price: "0.1 SOL",
    prize: "1 SOL",
    ticketsSold: 0,
    totalTickets: 50,
    endsIn: { days: 1, hours: 8, minutes: 15 },
    isLocked: false,
  },
  {
    id: 1,
    title: "0.5 SOL",
    image: "/raffle-icon.png",
    price: "0.03 SOL",
    prize: "0.5 SOL",
    ticketsSold: 0,
    totalTickets: 80,
    endsIn: { days: 2, hours: 14, minutes: 32 },
    isLocked: false,
  },
  {
    id: 4,
    title: "4 SOL",
    image: "/raffle-icon.png",
    price: "FREE",
    prize: "4 SOL",
    ticketsSold: 0,
    totalTickets: 100,
    endsIn: { days: 3, hours: 5, minutes: 22 },
    isLocked: false,
  },
]

export function RaffleGrid() {
  const [rafflesWithTickets, setRafflesWithTickets] = useState(raffles)

  useEffect(() => {
    async function loadRaffleData() {
      const activeRounds = await getAllActiveRounds()

      const updatedRaffles = raffles.map((raffle) => {
        const round = activeRounds.find((r) => r.raffle_id === raffle.id.toString())
        return {
          ...raffle,
          ticketsSold: round?.total_tickets_sold || raffle.ticketsSold,
        }
      })
      setRafflesWithTickets(updatedRaffles)
    }

    loadRaffleData()

    const interval = setInterval(loadRaffleData, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <section id="raffles" className="relative pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {rafflesWithTickets.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>
      </div>
    </section>
  )
}
