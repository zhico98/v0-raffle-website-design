import { Navbar } from "@/components/navbar"
import { HeroBanner } from "@/components/hero-banner"
import { RaffleGrid } from "@/components/raffle-grid"
import { BackgroundEffects } from "@/components/background-effects"
import { WinnersTicker } from "@/components/winners-ticker"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden pb-[45px]">
      <BackgroundEffects />
      <Navbar />
      <HeroBanner />
      <RaffleGrid />
      <WinnersTicker />
      <Footer />
    </main>
  )
}
