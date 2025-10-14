"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RaffleFilters() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [minPrice, setMinPrice] = useState("0")
  const [maxPrice, setMaxPrice] = useState("9999")
  const [searchQuery, setSearchQuery] = useState("")

  const handleReset = () => {
    setActiveCategory("all")
    setMinPrice("0")
    setMaxPrice("9999")
    setSearchQuery("")
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 mb-8">
      <div className="container mx-auto">
        <div
          className="rounded-2xl p-6 border border-[rgba(255,215,0,0.15)]"
          style={{
            background: "rgba(10, 10, 15, 0.6)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">
            {/* Left side - Category filters and price range */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category buttons */}
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("all")}
                className={`rounded-full px-4 h-9 text-xs uppercase font-semibold transition-all ${
                  activeCategory === "all"
                    ? "bg-gradient-to-r from-[#FFD700] to-[#FFB800] text-black border-0"
                    : "bg-transparent border border-[rgba(255,215,0,0.3)] text-[#b8b8b8] hover:text-[#FFD95E] hover:border-[rgba(255,215,0,0.5)]"
                }`}
              >
                All
              </Button>
              <Button
                variant={activeCategory === "crypto" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("crypto")}
                className={`rounded-full px-4 h-9 text-xs uppercase font-semibold transition-all ${
                  activeCategory === "crypto"
                    ? "bg-gradient-to-r from-[#FFD700] to-[#FFB800] text-black border-0"
                    : "bg-transparent border border-[rgba(255,215,0,0.3)] text-[#b8b8b8] hover:text-[#FFD95E] hover:border-[rgba(255,215,0,0.5)]"
                }`}
              >
                Crypto
              </Button>

              {/* Price range */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#b8b8b8] uppercase">Price</span>
                <Input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-20 h-9 bg-black/40 border-[rgba(255,215,0,0.2)] text-white text-xs rounded-lg"
                  placeholder="0"
                />
                <span className="text-[#b8b8b8]">-</span>
                <Input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-20 h-9 bg-black/40 border-[rgba(255,215,0,0.2)] text-white text-xs rounded-lg"
                  placeholder="9999"
                />
              </div>

              {/* Currency and Sort */}
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-4 h-9 text-xs uppercase font-semibold bg-transparent border border-[rgba(255,215,0,0.3)] text-[#b8b8b8] hover:text-[#FFD95E] hover:border-[rgba(255,215,0,0.5)]"
              >
                BNB
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-4 h-9 text-xs uppercase font-semibold bg-transparent border border-[rgba(255,215,0,0.3)] text-[#b8b8b8] hover:text-[#FFD95E] hover:border-[rgba(255,215,0,0.5)]"
              >
                Sort
              </Button>

              {/* Ending Soon dropdown */}
              <Select defaultValue="ending-soon">
                <SelectTrigger className="w-[140px] h-9 rounded-full bg-black/40 border-[rgba(255,215,0,0.2)] text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0f] border-[rgba(255,215,0,0.2)]">
                  <SelectItem value="ending-soon" className="text-white">
                    Ending Soon
                  </SelectItem>
                  <SelectItem value="newest" className="text-white">
                    Newest
                  </SelectItem>
                  <SelectItem value="popular" className="text-white">
                    Most Popular
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right side - Search and Reset */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prizes..."
                className="flex-1 lg:w-64 h-9 bg-black/40 border-[rgba(255,215,0,0.2)] text-white text-sm rounded-lg placeholder:text-[#666]"
              />
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="rounded-full px-5 h-9 text-xs uppercase font-semibold bg-transparent border border-[rgba(255,215,0,0.3)] text-[#b8b8b8] hover:text-[#FFD95E] hover:border-[rgba(255,215,0,0.5)]"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
