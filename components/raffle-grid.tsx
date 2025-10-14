"use client"

import { RaffleCard } from "@/components/raffle-card"
import { useState, useEffect } from "react"
import { getAllActiveRounds } from "@/lib/raffle-rounds"

const raffles = [
  {
    id: 3,
    title: "0.23 BNB",
    image: "/raffle-icon.png",
    price: "0.0194 BNB",
    prize: "0.23 BNB",
    ticketsSold: 0,
    totalTickets: 20,
    endsIn: { days: 0, hours: 23, minutes: 47 },
    isLocked: false,
  },
  {
    id: 2,
    title: "0.0777 BNB",
    image: "/raffle-icon.png",
    price: "0.0078 BNB",
    prize: "0.0777 BNB",
    ticketsSold: 0,
    totalTickets: 50,
    endsIn: { days: 1, hours: 8, minutes: 15 },
    isLocked: false,
  },
  {
    id: 1,
    title: "0.0389 BNB",
    image: "/raffle-icon.png",
    price: "0.0023 BNB",
    prize: "0.0389 BNB",
    ticketsSold: 0,
    totalTickets: 80,
    endsIn: { days: 2, hours: 14, minutes: 32 },
    isLocked: false,
  },
  {
    id: 4,
    title: "0.322 BNB",
    image: "/raffle-icon.png",
    price: "FREE",
    prize: "0.322 BNB",
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
