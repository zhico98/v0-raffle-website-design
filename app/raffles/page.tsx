import { Navbar } from "@/components/navbar"
import { RaffleFilters } from "@/components/raffle-filters"
import { RaffleGrid } from "@/components/raffle-grid"
import { BackgroundEffects } from "@/components/background-effects"
import { WinnersTicker } from "@/components/winners-ticker"

export default function RafflesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundEffects />
      <Navbar />
      <div className="pt-24 pb-20">
        <RaffleFilters />
        <RaffleGrid />
      </div>
      <WinnersTicker />
    </main>
  )
}
