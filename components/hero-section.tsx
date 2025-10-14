"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Overline */}
          <div className="inline-block">
            <span className="text-primary/80 text-sm font-mono tracking-[0.3em] uppercase">Next-Gen Raffles</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
            <span className="block text-balance">Win Big with</span>
            <span className="block bg-gradient-to-r from-primary via-yellow-300 to-primary bg-clip-text text-transparent gradient-flow">
              Crypto Raffles
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto text-balance leading-relaxed">
            Enter premium raffles for exclusive prizes. Transparent, secure, and powered by blockchain technology.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] font-bold px-8 rounded-full text-lg glow-pulse"
            >
              Explore Raffles
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary/50 text-foreground hover:border-primary hover:bg-primary/10 transition-all duration-300 rounded-full px-8 text-lg bg-transparent"
            >
              How It Works
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="pt-12 animate-bounce">
            <ArrowDown className="w-6 h-6 mx-auto text-primary/60" />
          </div>
        </div>
      </div>
    </section>
  )
}
