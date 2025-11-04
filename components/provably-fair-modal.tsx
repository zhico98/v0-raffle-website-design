"use client"
import { Button } from "@/components/ui/button"

interface ProvablyFairModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProvablyFairModal({ isOpen, onClose }: ProvablyFairModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-black/30 backdrop-blur-md border border-[rgba(153,69,255,0.2)] rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="font-heading text-2xl font-bold text-white mb-4">Provably Fair</h2>

        <p className="text-sm text-[#b8b8b8] mb-6 leading-relaxed">
          We use a transparent commit-reveal scheme to select winners proportionally to tickets.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-white mb-2">
              <span className="font-bold">1. Commit.</span> Before the draw we publish a SHA-256 hash of a secret
              payload (nonce + secret + timestamp).
            </p>
          </div>

          <div>
            <p className="text-sm text-white mb-2">
              <span className="font-bold">2. Reveal.</span> At draw time we reveal the exact payload that reproduces the
              commit hash.
            </p>
          </div>

          <div>
            <p className="text-sm text-white mb-2">
              <span className="font-bold">3. Derive random.</span> The revealed payload deterministically produces a
              random number which maps into the weighted list of entries to select the winner.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#777] mb-6 leading-relaxed">
          After each raffle ends, a verification payload is recorded on our backend and can be inspected on the raffle
          page.
        </p>

        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="px-8 py-2 rounded-full font-semibold text-sm transition-all hover:scale-[1.03]"
            style={{
              background: "linear-gradient(90deg, #9945FF, #7928CA)",
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
