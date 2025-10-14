"use client"

import { useEffect, useState } from "react"
import { initializeRaffleRounds } from "@/lib/actions/raffle-actions"

export function RaffleInitializer() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized) {
      initializeRaffleRounds().then((result) => {
        if (result.success) {
          console.log("[v0] Raffle rounds check:", result.message)
          setInitialized(true)
        }
      })
    }
  }, [initialized])

  return null
}
