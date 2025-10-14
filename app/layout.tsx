import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Orbitron, Poppins } from "next/font/google"
import { WalletProvider } from "@/contexts/wallet-context"
import { RaffleInitializer } from "@/components/raffle-initializer"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-orbitron",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "lotta.gg - Premium Crypto Raffle Platform",
  description: "Raffle. Reveal. Reward. Premium crypto raffle platform with transparent blockchain-based draws.",
  generator: "v0.app",
  metadataBase: new URL("https://www.lotta.gg"),
  keywords: ["crypto", "raffle", "lottery", "blockchain", "win", "prizes", "ethereum"],
  authors: [{ name: "lotta.gg" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.lotta.gg",
    siteName: "lotta.gg",
    title: "lotta.gg - Premium Crypto Raffle Platform",
    description: "Raffle. Reveal. Reward. Premium crypto raffle platform with transparent blockchain-based draws.",
    images: [
      {
        url: "/favicon.png",
        width: 1200,
        height: 630,
        alt: "lotta.gg - Premium Crypto Raffle Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "lotta.gg - Premium Crypto Raffle Platform",
    description: "Raffle. Reveal. Reward. Premium crypto raffle platform with transparent blockchain-based draws.",
    images: ["/favicon.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${poppins.variable} font-sans antialiased`}>
        <WalletProvider>
          <RaffleInitializer />
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <Analytics />
        </WalletProvider>
      </body>
    </html>
  )
}
