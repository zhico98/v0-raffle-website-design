"use client"

import { CheckCircle2, X } from "lucide-react"
import { useEffect, useState } from "react"

interface RaffleToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export function RaffleToast({ message, isVisible, onClose }: RaffleToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 300)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
        show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-gradient-to-r from-black to-[#1a1a1a] border-2 border-[#9945FF] rounded-lg shadow-lg p-3 pr-10 min-w-[280px] max-w-[400px]">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#9945FF]" />
          </div>
          <p className="text-sm font-medium text-white">{message}</p>
        </div>
        <button
          onClick={() => {
            setShow(false)
            setTimeout(onClose, 300)
          }}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>
    </div>
  )
}
