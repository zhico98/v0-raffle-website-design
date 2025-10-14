"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Check, ExternalLink, TrendingUp, TrendingDown, Plus } from "lucide-react"
import { getTransactions, type Transaction } from "@/lib/actions/transaction-actions"
import { getUserStats } from "@/lib/actions/user-actions"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { userProfile, updateUserProfile, account, balance } = useWallet()
  const [activeTab, setActiveTab] = useState<"options" | "statistics" | "transactions">("options")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    twitter: "",
    avatar: "",
  })
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({
    ticketsPurchased: 0,
    totalSpent: "0",
    rafflesEntered: 0,
    rafflesWon: 0,
    totalWinnings: "0",
  })
  const [memberSince, setMemberSince] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        twitter: userProfile.twitter || "",
        avatar: userProfile.avatar || "",
      })
    }
  }, [isOpen, userProfile])

  useEffect(() => {
    if (isOpen && account) {
      loadTransactionsAndStats()
    }
  }, [isOpen, account])

  const loadTransactionsAndStats = async () => {
    if (!account) return

    setIsLoading(true)
    try {
      // Load transactions from Supabase
      const txResult = await getTransactions(account)
      if (txResult.success && txResult.data) {
        setTransactions(txResult.data)
        console.log("[v0] Loaded transactions from Supabase:", txResult.data.length)

        // Calculate stats from transactions
        const ticketsPurchased = txResult.data.reduce((sum, tx) => sum + (tx.ticketCount || 0), 0)
        const totalSpent = txResult.data
          .filter((tx) => tx.type === "raffle_entry")
          .reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0)
        const rafflesEntered = new Set(txResult.data.map((tx) => tx.raffleId)).size

        setStats({
          ticketsPurchased,
          totalSpent: totalSpent.toFixed(4),
          rafflesEntered,
          rafflesWon: 0,
          totalWinnings: "0",
        })

        // Set member since date
        if (txResult.data.length > 0) {
          const firstTx = [...txResult.data].sort((a, b) => a.timestamp - b.timestamp)[0]
          setMemberSince(new Date(firstTx.timestamp).toLocaleDateString())
        } else {
          setMemberSince(new Date().toLocaleDateString())
        }
      }

      // Load user stats from Supabase
      const statsResult = await getUserStats(account)
      if (statsResult.success && statsResult.data) {
        console.log("[v0] Loaded user stats from Supabase:", statsResult.data)
      }
    } catch (error) {
      console.error("[v0] Error loading transactions and stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateUserProfile({
        name: formData.name,
        email: formData.email,
        twitter: formData.twitter,
        avatar: formData.avatar,
      })
      console.log("[v0] Profile saved:", formData)

      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setFormData({ ...formData, avatar: base64String })
        console.log("[v0] Avatar uploaded")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setFormData({ ...formData, avatar: "" })
  }

  const winRate = stats.rafflesEntered > 0 ? ((stats.rafflesWon / stats.rafflesEntered) * 100).toFixed(1) : "0"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] rounded-xl border border-[rgba(255,215,0,0.2)] bg-[#0a0a0a] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] h-full max-h-[90vh]">
          <div className="border-r border-[rgba(255,215,0,0.1)] bg-black/40 p-6 space-y-2">
            <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                activeTab === "options"
                  ? "bg-[rgba(255,215,0,0.1)] text-[#f5d36c] border border-[rgba(255,215,0,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("options")}
            >
              Options
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                activeTab === "statistics"
                  ? "bg-[rgba(255,215,0,0.1)] text-[#f5d36c] border border-[rgba(255,215,0,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("statistics")}
            >
              Statistics
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                activeTab === "transactions"
                  ? "bg-[rgba(255,215,0,0.1)] text-[#f5d36c] border border-[rgba(255,215,0,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </Button>
          </div>

          <div className="overflow-y-auto p-8 transition-all duration-300 ease-in-out">
            <div className="min-h-full">
              {activeTab === "options" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-start gap-6">
                    <div className="relative group">
                      <div
                        className="w-24 h-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#F0C040] transition-all"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {formData.avatar ? (
                          <img
                            src={formData.avatar || "/placeholder.svg"}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Plus className="w-8 h-8 text-white/40 group-hover:text-[#F0C040] transition-colors" />
                            <span className="text-white/40 text-xs group-hover:text-[#F0C040] transition-colors">
                              Add Photo
                            </span>
                          </div>
                        )}
                      </div>
                      {formData.avatar && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveAvatar()
                          }}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-black hover:bg-gray-900 transition-colors"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
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
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-black/40 border-white/10 text-white"
                        placeholder="Enter your username"
                      />
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

                    <div className="space-y-2">
                      <Button
                        onClick={handleSave}
                        disabled={saveSuccess || isLoading}
                        className={`w-full transition-all ${
                          saveSuccess
                            ? "bg-green-600 hover:bg-green-600"
                            : "bg-gradient-to-r from-[#FFD700] to-[#FFB800] hover:from-[#FFE55C] hover:to-[#FFD700]"
                        } text-black font-semibold`}
                      >
                        {saveSuccess ? (
                          <span className="flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            Saved Successfully!
                          </span>
                        ) : isLoading ? (
                          "Saving..."
                        ) : (
                          "Save"
                        )}
                      </Button>

                      {saveSuccess && (
                        <p className="text-green-500 text-sm text-center animate-pulse">
                          Your profile has been saved and will be remembered next time you connect!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "statistics" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pr-16">
                    <h2 className="text-2xl font-bold text-white">Your Statistics</h2>
                    <div className="text-sm text-white/60">
                      Balance:{" "}
                      <span className="text-[#F0C040] font-semibold">{Number.parseFloat(balance).toFixed(4)} BNB</span>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-8">
                      <p className="text-white/40">Loading statistics...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                          <p className="text-white/60 text-sm mb-1">Total Tickets</p>
                          <p className="text-3xl font-bold text-white">{stats.ticketsPurchased}</p>
                        </div>
                        <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                          <p className="text-white/60 text-sm mb-1">Total Wins</p>
                          <p className="text-3xl font-bold text-green-500">{stats.rafflesWon}</p>
                        </div>
                        <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                          <p className="text-white/60 text-sm mb-1">Total Spent</p>
                          <p className="text-3xl font-bold text-white">{stats.totalSpent} BNB</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                          <p className="text-white/60 text-sm mb-1">Win Rate</p>
                          <p className="text-2xl font-bold text-[#FFD700]">{winRate}%</p>
                        </div>
                        <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                          <p className="text-white/60 text-sm mb-1">Raffles Entered</p>
                          <p className="text-2xl font-bold text-white">{stats.rafflesEntered}</p>
                        </div>
                        <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                          <p className="text-white/60 text-sm mb-1">Member Since</p>
                          <p className="text-xl font-bold text-white">{memberSince}</p>
                        </div>
                      </div>

                      <div className="bg-black/40 border border-white/10 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                        {transactions.length > 0 ? (
                          <div className="space-y-3">
                            {transactions.slice(0, 5).map((tx, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-2 rounded-lg ${
                                      tx.type === "raffle_entry"
                                        ? "bg-yellow-500/10"
                                        : tx.type === "prize_claim"
                                          ? "bg-green-500/10"
                                          : "bg-yellow-500/10"
                                    }`}
                                  >
                                    {tx.type === "raffle_entry" ? (
                                      <TrendingDown className="w-4 h-4 text-[#FFD700]" />
                                    ) : (
                                      <TrendingUp className="w-5 h-5 text-green-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-white text-sm font-medium">
                                      {tx.type === "raffle_entry"
                                        ? "Raffle Entry"
                                        : tx.type === "prize_claim"
                                          ? "Prize Claimed"
                                          : "Refund"}
                                    </p>
                                    <p className="text-white/40 text-xs">
                                      {new Date(tx.timestamp).toLocaleDateString()} at{" "}
                                      {new Date(tx.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={`text-sm font-semibold ${
                                      tx.type === "raffle_entry" ? "text-red-400" : "text-green-400"
                                    }`}
                                  >
                                    {tx.type === "raffle_entry" ? "-" : "+"}
                                    {tx.amount} BNB
                                  </p>
                                  <p className="text-white/40 text-xs">
                                    {tx.ticketCount && `${tx.ticketCount} ticket${tx.ticketCount > 1 ? "s" : ""}`}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-white/40 text-center py-8">No recent activity</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "transactions" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p className="text-white/40">Loading transactions...</p>
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((tx, index) => (
                        <div key={index} className="bg-black/40 border border-white/10 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  tx.status === "confirmed"
                                    ? "bg-green-500/10"
                                    : tx.status === "pending"
                                      ? "bg-yellow-500/10"
                                      : "bg-red-500/10"
                                }`}
                              >
                                {tx.type === "raffle_entry" ? (
                                  <TrendingDown
                                    className={`w-5 h-5 ${
                                      tx.status === "confirmed"
                                        ? "text-[#FFD700]"
                                        : tx.status === "pending"
                                          ? "text-yellow-400"
                                          : "text-red-400"
                                    }`}
                                  />
                                ) : (
                                  <TrendingUp className="w-5 h-5 text-green-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-white font-semibold">
                                  {tx.type === "raffle_entry"
                                    ? "Raffle Entry"
                                    : tx.type === "prize_claim"
                                      ? "Prize Claimed"
                                      : "Refund"}
                                </p>
                                <p className="text-white/60 text-sm">Raffle #{tx.raffleId}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-lg font-bold ${
                                  tx.type === "raffle_entry" ? "text-red-400" : "text-green-400"
                                }`}
                              >
                                {tx.type === "raffle_entry" ? "-" : "+"}
                                {tx.amount} BNB
                              </p>
                              <p
                                className={`text-xs font-semibold ${
                                  tx.status === "confirmed"
                                    ? "text-green-400"
                                    : tx.status === "pending"
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                }`}
                              >
                                {tx.status.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-white/60">
                            <div>
                              <p>{new Date(tx.timestamp).toLocaleString()}</p>
                              {tx.ticketCount && (
                                <p className="text-white/40 text-xs mt-1">
                                  {tx.ticketCount} ticket{tx.ticketCount > 1 ? "s" : ""} purchased
                                </p>
                              )}
                            </div>
                            <a
                              href={`https://bscscan.com/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[#F0C040] hover:text-[#FFE55C] transition-colors"
                            >
                              View on BscScan
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-black/40 border border-white/10 rounded-lg p-12">
                      <p className="text-white/40 text-center">No transactions found</p>
                      <p className="text-white/30 text-sm text-center mt-2">Your raffle entries will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
