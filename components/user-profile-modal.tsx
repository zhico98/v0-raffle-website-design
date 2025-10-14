"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; email?: string; twitter?: string }) => void
}

export function UserProfileModal({ isOpen, onClose, onSubmit }: UserProfileModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [twitter, setTwitter] = useState("")
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Name is required")
      return
    }

    onSubmit({
      name: name.trim(),
      email: email.trim() || undefined,
      twitter: twitter.trim() || undefined,
    })

    // Reset form
    setName("")
    setEmail("")
    setTwitter("")
    setError("")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg border border-white/10 bg-gradient-to-b from-gray-900 to-black p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
          <p className="text-sm text-gray-400">Tell us a bit about yourself to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white mb-2 block">
              Name <span className="text-[#FFD700]">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError("")
              }}
              placeholder="Enter your name"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-white mb-2 block">
              Email <span className="text-gray-500 text-xs">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <Label htmlFor="twitter" className="text-white mb-2 block">
              Twitter <span className="text-gray-500 text-xs">(optional)</span>
            </Label>
            <Input
              id="twitter"
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@username"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold hover:opacity-90 transition-opacity"
          >
            Complete Setup
          </Button>
        </form>
      </div>
    </div>
  )
}
