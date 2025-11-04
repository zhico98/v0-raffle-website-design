"use client"

import { Ticket } from "lucide-react"

const recentActivity = [
  { address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" },
  { address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1" },
  { address: "9SwgXjNXe7wTAyrenQMsk7YmAzCbmScPiH5ZrpHZTUZf" },
  { address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" },
  { address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1" },
  { address: "9SwgXjNXe7wTAyrenQMsk7YmAzCbmScPiH5ZrpHZTUZf" },
  { address: "3mPqKvZfWpQ7VgPKbUK5LkHnEJKj2sZQXSkL9kL9R" },
  { address: "8Hn2vBxKjRqT3WpYvC4MzNxEuFvB4T" },
  { address: "6Yz7wC3MnPqRsT8XvD2KjLwC3M" },
  { address: "4Qr5xD8NkMpQrS7YwE3LjKxD8N" },
]

export function WinnersTicker() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/70 backdrop-blur-md border-t border-[#1a1a1a] overflow-hidden">
      <div className="flex items-center gap-6 px-6 py-2.5">
        <div className="flex gap-6 animate-marquee">
          {[...recentActivity, ...recentActivity].map((activity, i) => (
            <div key={i} className="flex items-center gap-2 text-xs shrink-0">
              <Ticket className="w-3.5 h-3.5 text-[#9945FF]" />
              <span className="text-white font-medium">
                {activity.address.slice(0, 4)}...{activity.address.slice(-4)}
              </span>
              <span className="text-[#9945FF] font-medium">bought a ticket</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
