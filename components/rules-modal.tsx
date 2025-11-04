"use client"
import { Button } from "@/components/ui/button"

interface RulesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-black/30 backdrop-blur-md border border-[rgba(153,69,255,0.2)] rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="font-heading text-2xl font-bold text-white mb-6">Raffle Rules</h2>

        <div className="mb-6">
          <h3 className="font-heading text-lg font-bold text-[#9945FF] mb-3">How it works</h3>
          <ul className="space-y-2 text-sm text-[#b8b8b8] leading-relaxed list-disc list-inside">
            <li>Buy tickets to enter the raffle before the countdown ends.</li>
            <li>
              At end time, a winner is selected proportionally to tickets using a provably fair commit–reveal scheme.
            </li>
            <li>
              Some raffles may enforce a per-wallet ticket limit. Free raffles allow one free entry per wallet - no
              payment required.
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="font-heading text-lg font-bold text-[#9945FF] mb-3">Payout rules</h3>
          <ul className="space-y-2 text-sm text-[#b8b8b8] leading-relaxed list-disc list-inside">
            <li>
              <span className="font-semibold text-white">Under 50% sold:</span> Winner receives 100% of the post-rake
              ticket pot (in SOL).
            </li>
            <li>
              <span className="font-semibold text-white">50%+ sold:</span> Winner receives the full advertised prize (in
              SOL).
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="font-heading text-lg font-bold text-[#9945FF] mb-3">Notes</h3>
          <ul className="space-y-2 text-sm text-[#b8b8b8] leading-relaxed list-disc list-inside">
            <li>Free-entry raffles always pay the full advertised prize.</li>
            <li>Network gas fees apply to on-chain transactions on Solana; keep a small SOL buffer for fees.</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="px-8 py-2 rounded-full font-semibold text-sm transition-all hover:scale-[1.03]"
            style={{
              background: "linear-gradient(90deg, #9945FF, #c084fc)",
              color: "#fff",
              boxShadow: "0 0 20px rgba(153,69,255,0.4)",
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
