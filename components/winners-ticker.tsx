"use client"

import { Ticket } from "lucide-react"

const recentActivity = [
  { address: "7xKX...gAsU" },
  { address: "5Q54...e4j1" },
  { address: "9Swg...ZiVf" },
  { address: "7xKX...gAsU" },
  { address: "5Q54...e4j1" },
  { address: "9Swg...ZiVf" },
  { address: "3mPq...kL9R" },
  { address: "8Hn2...vB4T" },
  { address: "6Yz7...wC3M" },
  { address: "4Qr5...xD8N" },
]

export function WinnersTicker() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/70 backdrop-blur-md border-t border-[#1a1a1a] overflow-hidden">
      <div className="flex items-center gap-6 px-6 py-2.5">
        <div className="flex gap-6 animate-marquee">
          {[...recentActivity, ...recentActivity].map((activity, i) => (
            <div key={i} className="flex items-center gap-2 text-xs shrink-0">
              <Ticket className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="text-white font-medium">{activity.address}</span>
              <span className="text-[#FFD700] font-medium">bought a ticket</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
