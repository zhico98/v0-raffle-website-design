"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"

export function Navbar() {
  const { account, isConnected, userProfile, connectWallet, disconnectWallet, openProfileModal } = useWallet()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const displayText = () => {
    if (!isConnected || !account) return "Connect Wallet"
    if (userProfile?.name) return userProfile.name
    return formatAddress(account)
  }

  const handleWalletClick = () => {
    if (isConnected) {
      openProfileModal()
    } else {
      connectWallet()
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-20 bg-black/60 border-b border-[rgba(255,215,0,0.15)]"
      style={{ backdropFilter: "blur(12px)" }}
    >
      <div className="container mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <span
                className="font-heading font-bold text-2xl text-[#FFD700] tracking-wide group-hover:brightness-110 transition-all"
                style={{ textShadow: "0 0 16px rgba(255,215,0,0.5)" }}
              >
                LOTTA.GG
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/raffles"
                className="text-sm text-foreground/80 hover:text-[#FFD95E] transition-all tracking-wide"
                style={{ transition: "all 0.2s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textShadow = "0 0 6px rgba(255,215,0,0.25)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textShadow = "none"
                }}
              >
                Raffles
              </Link>
              <Link
                href="/winners"
                className="text-sm text-foreground/80 hover:text-[#FFD95E] transition-all tracking-wide"
                style={{ transition: "all 0.2s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textShadow = "0 0 6px rgba(255,215,0,0.25)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textShadow = "none"
                }}
              >
                Winners
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm text-foreground/80 hover:text-[#FFD95E] transition-all tracking-wide"
                style={{ transition: "all 0.2s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textShadow = "0 0 6px rgba(255,215,0,0.25)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textShadow = "none"
                }}
              >
                Leaderboard
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                onClick={handleWalletClick}
                className="h-9 px-5 rounded-full font-semibold text-sm transition-all hover:scale-[1.03]"
                style={{
                  background: "linear-gradient(90deg, #F0C040, #FFB800)",
                  color: "#000",
                  boxShadow: "0 0 10px rgba(240,192,64,0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(240,192,64,0.4)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(240,192,64,0.25)"
                }}
              >
                {displayText()}
              </Button>
              {isConnected && userProfile?.avatar && (
                <div
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full border-2 border-[#F0C040] overflow-hidden bg-black cursor-pointer hover:scale-110 transition-transform"
                  onClick={openProfileModal}
                  style={{
                    boxShadow: "0 0 8px rgba(240,192,64,0.4)",
                  }}
                >
                  <img
                    src={userProfile.avatar || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {isConnected && (
              <Button
                onClick={disconnectWallet}
                className="h-9 px-5 rounded-full font-semibold text-sm uppercase transition-all hover:scale-[1.03]"
                style={{
                  background: "transparent",
                  border: "2px solid #F0C040",
                  color: "#F0C040",
                  boxShadow: "0 0 8px rgba(240,192,64,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(240,192,64,0.1)"
                  e.currentTarget.style.boxShadow = "0 0 12px rgba(240,192,64,0.35)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.boxShadow = "0 0 8px rgba(240,192,64,0.2)"
                }}
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
