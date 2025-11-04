"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { BackgroundEffects } from "@/components/background-effects"
import { WinnersTicker } from "@/components/winners-ticker"

export default function WinnersPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundEffects />
      <Navbar />
      <div className="pt-24 pb-32 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#9945ff] mb-8 opacity-100">Winners</h1>

          {/* Table Container */}
          <div className="rounded-xl border border-[rgba(153,69,255,0.1)] overflow-hidden bg-black/40 backdrop-blur-sm">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-[rgba(153,69,255,0.1)] bg-black/60">
              <div className="text-sm font-semibold text-[#b8b8b8] uppercase tracking-wide">Winner</div>
              <div className="text-sm font-semibold text-[#b8b8b8] uppercase tracking-wide">Raffle</div>
              <div className="text-sm font-semibold text-[#b8b8b8] uppercase tracking-wide">Tickets</div>
              <div className="text-sm font-semibold text-[#b8b8b8] uppercase tracking-wide">Date</div>
              <div className="text-sm font-semibold text-[#b8b8b8] uppercase tracking-wide">Links</div>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-20 h-20 rounded-full bg-[rgba(153,69,255,0.1)] flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-[#9945ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-6">No Winners Yet</h3>
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-full font-semibold text-sm uppercase transition-all hover:scale-[1.03]"
                style={{
                  background: "linear-gradient(90deg, #9945ff, #7d2edb)",
                  color: "#ffffff",
                  boxShadow: "0 0 10px rgba(153,69,255,0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(153,69,255,0.4)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(153,69,255,0.25)"
                }}
              >
                Browse Raffles
              </Link>
            </div>
          </div>
        </div>
      </div>
      <WinnersTicker />
    </main>
  )
}
