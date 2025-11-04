"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { BackgroundEffects } from "@/components/background-effects"
import { WinnersTicker } from "@/components/winners-ticker"

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "week" | "month">("all")

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundEffects />
      <Navbar />
      <div className="pt-24 pb-32 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#9945ff] mb-4 opacity-100">
              Leaderboards
            </h1>
            <p className="text-[#b8b8b8] text-base max-w-2xl mx-auto">
              Compete with other players and earn rewards! Top performers get weekly prizes and special recognition.
            </p>
          </div>

          {/* Time Period Filter */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => setSelectedPeriod("all")}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm uppercase tracking-wide transition-all ${
                selectedPeriod === "all"
                  ? "bg-[#9945ff] text-white"
                  : "bg-transparent text-[#b8b8b8] border border-[rgba(153,69,255,0.2)] hover:border-[rgba(153,69,255,0.4)]"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedPeriod("week")}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm uppercase tracking-wide transition-all ${
                selectedPeriod === "week"
                  ? "bg-[#9945ff] text-white"
                  : "bg-transparent text-[#b8b8b8] border border-[rgba(153,69,255,0.2)] hover:border-[rgba(153,69,255,0.4)]"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm uppercase tracking-wide transition-all ${
                selectedPeriod === "month"
                  ? "bg-[#9945ff] text-white"
                  : "bg-transparent text-[#b8b8b8] border border-[rgba(153,69,255,0.2)] hover:border-[rgba(153,69,255,0.4)]"
              }`}
            >
              This Month
            </button>
          </div>

          {/* Top Players Section */}
          <div className="rounded-xl border border-[rgba(153,69,255,0.1)] overflow-hidden bg-black/40 backdrop-blur-sm">
            {/* Section Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(153,69,255,0.1)] bg-black/60">
              <h2 className="font-heading text-xl font-bold text-foreground">Top Players</h2>
              <span className="text-sm text-[#b8b8b8] uppercase tracking-wide">
                Period: {selectedPeriod === "all" ? "ALL" : selectedPeriod === "week" ? "WEEK" : "MONTH"}
              </span>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-20 h-20 rounded-full bg-[rgba(153,69,255,0.1)] flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-[#9945ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">No Players Yet</h3>
              <p className="text-[#b8b8b8] text-sm mb-6">Be the first to climb the leaderboard!</p>
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
                Enter Raffles
              </Link>
            </div>
          </div>
        </div>
      </div>
      <WinnersTicker />
    </main>
  )
}
