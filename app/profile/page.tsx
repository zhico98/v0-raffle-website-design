"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { userProfile, isConnected } = useWallet()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"options" | "statistics" | "transactions">("options")
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    discord: "",
    twitter: userProfile?.twitter || "",
  })

  if (!isConnected) {
    router.push("/")
    return null
  }

  const handleSave = () => {
    console.log("[v0] Saving profile:", formData)
    // TODO: Save to backend/context
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-2">
            <Button
              variant={activeTab === "options" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "options"
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("options")}
            >
              Options
            </Button>
            <Button
              variant={activeTab === "statistics" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "statistics"
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("statistics")}
            >
              Statistics
            </Button>
            <Button
              variant={activeTab === "transactions" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "transactions"
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </Button>
          </div>

          {/* Main Content */}
          <Card className="bg-black/40 border-white/10 p-8">
            {activeTab === "options" && (
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-sm">
                    No Avatar
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{formData.name || "User"}</h2>
                    <p className="text-white/60 text-sm mb-1">Add your contact so we can reach winners</p>
                    <p className="text-white/40 text-xs">We only use this to contact winners.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white/80">
                      Username
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-black/40 border-white/10 text-white"
                      />
                      <Button variant="outline" className="border-white/20 text-white/80 bg-transparent">
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white/80">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <Label htmlFor="discord" className="text-white/80">
                      Discord
                    </Label>
                    <Input
                      id="discord"
                      placeholder="username#1234"
                      value={formData.discord}
                      onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                      className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitter" className="text-white/80">
                      X (Twitter) Handle
                    </Label>
                    <Input
                      id="twitter"
                      placeholder="@yourhandle"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white"
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "statistics" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Your Statistics</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">Total Tickets</p>
                    <p className="text-3xl font-bold text-white">0</p>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">Total Wins</p>
                    <p className="text-3xl font-bold text-green-500">0</p>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-white">0 BNB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">Win Rate</p>
                    <p className="text-2xl font-bold text-blue-500">0%</p>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">Favorite Type</p>
                    <p className="text-2xl font-bold text-white">BNB</p>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">Member Since</p>
                    <p className="text-xl font-bold text-white">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <p className="text-white/40 text-center py-8">No recent activity</p>
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                <div className="bg-black/40 border border-white/10 rounded-lg p-12">
                  <p className="text-white/40 text-center">No transactions found</p>
                </div>
                <div className="flex justify-center">
                  <Button variant="outline" className="border-white/20 text-white/80 bg-transparent">
                    Load More
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
