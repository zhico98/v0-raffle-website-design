"use client"

import { X } from "lucide-react"
import { useEffect } from "react"

interface WalletConnectionModalProps {
  isOpen: boolean
  status: "connecting" | "connected" | "error"
  onClose: () => void
}

export function WalletConnectionModal({ isOpen, status, onClose }: WalletConnectionModalProps) {
  // Auto-close after 3 seconds when successfully connected
  useEffect(() => {
    if (status === "connected") {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-8 shadow-2xl">
        {/* Close button */}
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Wallet Icon */}
          <div
            className={`relative w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
              status === "connected"
                ? "bg-gradient-to-br from-[#9945FF]/20 to-purple-500/20 border-2 border-[#9945FF]"
                : "bg-gradient-to-br from-gray-700/20 to-gray-800/20 border-2 border-gray-600"
            }`}
          >
            👻{status === "connected" && <div className="absolute inset-0 rounded-full bg-[#9945FF]/20 animate-ping" />}
          </div>

          {/* Status Text */}
          {status === "connecting" && (
            <>
              <h3 className="text-xl font-bold text-white">Sign to verify</h3>
              <p className="text-sm text-gray-400">Don't see your wallet? Check your other browser windows.</p>
              <div className="w-full mt-4">
                <button
                  disabled
                  className="w-full py-3 px-6 rounded-lg bg-gray-800 text-gray-400 font-medium cursor-not-allowed"
                >
                  Connecting...
                </button>
              </div>
            </>
          )}

          {status === "connected" && (
            <>
              <h3 className="text-xl font-bold text-white">Successfully connected with Phantom</h3>
              <p className="text-sm text-[#9945FF]">You're good to go!</p>
            </>
          )}

          {status === "error" && (
            <>
              <h3 className="text-xl font-bold text-white">Connection Failed</h3>
              <p className="text-sm text-red-400">Please try again or check your wallet.</p>
            </>
          )}

          {/* Protected by text */}
          <p className="text-xs text-gray-500 mt-4">Protected by Phantom</p>
        </div>
      </div>
    </div>
  )
}
