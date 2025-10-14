import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/30 backdrop-blur-md pt-6 pb-2">
      <div className="relative flex items-end justify-center w-full px-4">
        <p className="text-sm text-gray-400 text-center">© 2025 LOTTA.GG All rights reserved.</p>

        {/* Social icons - absolute positioned to far right */}
        <div className="absolute right-4 flex items-center gap-3">
          {/* X (Twitter) */}
          <a
            href="https://twitter.com/lottadotgg"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
            aria-label="Follow on X"
          >
            <Image
              src="/x-icon.png"
              alt="X (Twitter)"
              width={24}
              height={24}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/lottadotgg"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
            aria-label="Join Telegram"
          >
            <Image
              src="/telegram-icon.png"
              alt="Telegram"
              width={24}
              height={24}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
