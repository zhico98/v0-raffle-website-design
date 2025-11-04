"use client"

import Link from "next/link"

export function HeroBanner() {
  return (
    <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="bg-black/30 backdrop-blur-md border border-[#1c1c1c] rounded-xl p-8 shadow-lg">
          <h1
            className="font-heading font-semibold text-4xl mb-3 leading-tight"
            style={{
              background: "linear-gradient(135deg, #9945FF 0%, #c084fc 50%, #9945FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 12px rgba(153, 69, 255, 0.4)",
            }}
          >
            Raffle. Reveal. Reward.
          </h1>
          <p className="text-[#b8b8b8] text-sm mb-6">Small tickets big raffles all draws on-chain.</p>

          <div className="flex flex-wrap gap-3">
            <Link href="/raffles">
              <button
                className="relative overflow-hidden px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-[1.03]"
                style={{
                  background: "linear-gradient(90deg, #9945FF, #c084fc)",
                  color: "#fff",
                  boxShadow: "0 0 10px rgba(153,69,255,0.4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(153,69,255,0.6)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(153,69,255,0.4)"
                }}
              >
                <span className="relative z-10">Enter Raffles</span>
                <span
                  className="absolute inset-0 -translate-x-full animate-shimmer"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    animation: "shimmer 5s infinite",
                  }}
                />
              </button>
            </Link>

            <Link href="/raffles/4">
              <button className="px-6 py-2.5 rounded-lg bg-transparent border-2 border-[#9945FF]/60 text-foreground font-semibold text-sm hover:border-[#9945FF] hover:bg-[rgba(153,69,255,0.1)] hover:shadow-[0_0_20px_rgba(153,69,255,0.4)] transition-all">
                Daily Free Raffle
              </button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </section>
  )
}
