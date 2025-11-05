"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { WalletConnectionModal } from "@/components/wallet-connection-modal"
import { UserProfileModal } from "@/components/user-profile-modal"
import { ProfileModal } from "@/components/profile-modal"
import { getUserProfile, updateUserProfile as updateUserProfileAction } from "@/lib/actions/user-actions"

interface UserProfile {
  name: string
  email?: string
  twitter?: string
  avatar?: string
}

interface TransactionStatus {
  status: "idle" | "pending" | "confirmed" | "failed"
  hash?: string
  error?: string
}

interface WalletContextType {
  account: string | null
  isConnected: boolean
  userProfile: UserProfile | null
  transactionStatus: TransactionStatus
  balance: string
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  updateUserProfile: (profile: UserProfile) => void
  openProfileModal: () => void
  sendTransaction: (to: string, amount: string) => Promise<string>
  resetTransactionStatus: () => void
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const getPhantomProvider = () => {
  if (typeof window === "undefined") {
    return null
  }

  if ("phantom" in window) {
    const provider = (window as any).phantom?.solana
    if (provider?.isPhantom) {
      return provider
    }
  }

  return null
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({ status: "idle" })
  const [balance, setBalance] = useState<string>("0")
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  const loadProfileFromSupabase = async (address: string): Promise<UserProfile | null> => {
    if (isLoadingProfile) return null
    setIsLoadingProfile(true)

    try {
      const result = await getUserProfile(address)
      if (result.success && result.data) {
        console.log("[v0] Profile loaded from Supabase for address:", address, result.data)
        const profile = {
          name: result.data.username || "",
          email: result.data.email || "",
          twitter: result.data.twitter || "",
          avatar: result.data.avatar_url || undefined,
        }
        setUserProfile(profile)
        return profile
      }
    } catch (error) {
      console.error("[v0] Error loading profile from Supabase:", error)
    } finally {
      setIsLoadingProfile(false)
    }
    return null
  }

  const saveProfileToSupabase = async (address: string, profile: UserProfile) => {
    try {
      console.log("[v0] WalletContext: saveProfileToSupabase called")
      console.log("[v0] WalletContext: Address:", address)
      console.log("[v0] WalletContext: Profile data:", profile)

      const result = await updateUserProfileAction(address, {
        username: profile.name,
        email: profile.email,
        twitter: profile.twitter,
        avatar_url: profile.avatar || undefined,
      })

      console.log("[v0] WalletContext: updateUserProfileAction result:", result)

      if (result.success) {
        console.log("[v0] WalletContext: Profile saved successfully, updating local state")
        setUserProfile(profile)
      } else {
        console.error("[v0] WalletContext: Failed to save profile:", result.error)
      }
    } catch (error) {
      console.error("[v0] WalletContext: Exception in saveProfileToSupabase:", error)
    }
  }

  useEffect(() => {
    const provider = getPhantomProvider()
    if (provider) {
      provider.on("accountChanged", (publicKey: any) => {
        if (publicKey) {
          handleAccountsChanged(publicKey.toString())
        } else {
          disconnectWallet()
        }
      })

      provider.on("disconnect", () => {
        disconnectWallet()
      })
    }
  }, [])

  const handleAccountsChanged = async (address: string) => {
    if (!address) {
      disconnectWallet()
    } else if (address !== account) {
      setAccount(address)
      setIsConnected(true)
      await loadProfileFromSupabase(address)
      refreshBalance()
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const provider = getPhantomProvider()
      if (provider) {
        try {
          const response = await provider.connect({ onlyIfTrusted: true })
          if (response.publicKey) {
            const publicKey = response.publicKey.toString()
            setAccount(publicKey)
            setIsConnected(true)
            await loadProfileFromSupabase(publicKey)
            await refreshBalance()
            console.log("[v0] Phantom wallet auto-reconnected:", publicKey)
            return
          }
        } catch (err) {
          // User hasn't approved connection before, or rejected
          console.log("[v0] No trusted connection available")
        }

        // Fallback: check if already connected
        if (provider.isConnected && provider.publicKey) {
          const publicKey = provider.publicKey.toString()
          setAccount(publicKey)
          setIsConnected(true)
          await loadProfileFromSupabase(publicKey)
          await refreshBalance()
          console.log("[v0] Phantom wallet already connected:", publicKey)
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }

  const connectWallet = async () => {
    try {
      const provider = getPhantomProvider()

      if (!provider) {
        alert("Phantom wallet is not installed! Please install Phantom extension to connect your Solana wallet.")
        window.open("https://phantom.app/", "_blank")
        return
      }

      setModalOpen(true)
      setConnectionStatus("connecting")

      const response = await provider.connect()
      const publicKey = response.publicKey.toString()

      if (publicKey) {
        setAccount(publicKey)
        setIsConnected(true)

        const savedProfile = await loadProfileFromSupabase(publicKey)

        await refreshBalance()
        console.log("[v0] Phantom wallet connected:", publicKey)

        setConnectionStatus("connected")
        setTimeout(() => {
          setModalOpen(false)
          if (!savedProfile) {
            setShowProfileModal(true)
          }
        }, 2000)
      }
    } catch (error: any) {
      setConnectionStatus("error")

      if (error.code === 4001) {
        console.log("User rejected the connection request")
        setTimeout(() => setModalOpen(false), 2000)
      } else {
        console.error("Error connecting wallet:", error)
      }
    }
  }

  const handleProfileSubmit = async (profile: UserProfile) => {
    setUserProfile(profile)
    setShowProfileModal(false)
    if (account) {
      await saveProfileToSupabase(account, profile)
    }
    console.log("[v0] User profile saved:", profile)
  }

  const updateProfile = async (profile: UserProfile) => {
    console.log("[v0] WalletContext: updateProfile called")
    console.log("[v0] WalletContext: Profile:", profile)
    console.log("[v0] WalletContext: Account:", account)

    if (account) {
      await saveProfileToSupabase(account, profile)
    } else {
      console.error("[v0] WalletContext: No account connected, cannot save profile")
    }
  }

  const disconnectWallet = () => {
    const provider = getPhantomProvider()
    if (provider) {
      provider.disconnect()
    }
    setAccount(null)
    setIsConnected(false)
    setUserProfile(null)
    setBalance("0")
  }

  const openProfileModal = () => {
    setProfileModalOpen(true)
  }

  const sendTransaction = async (to: string, amount: string): Promise<string> => {
    try {
      if (!account) {
        throw new Error("No wallet connected")
      }

      const provider = getPhantomProvider()
      if (!provider) {
        throw new Error("Phantom wallet is not installed")
      }

      setTransactionStatus({ status: "pending" })

      // Import Solana web3.js dynamically
      const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import("@solana/web3.js")

      // Connect to Solana mainnet
      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed")

      // Convert SOL to lamports
      const lamports = Math.floor(Number.parseFloat(amount) * LAMPORTS_PER_SOL)

      console.log("[v0] Sending transaction:", { to, amount, lamports })

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(account),
          toPubkey: new PublicKey(to),
          lamports,
        }),
      )

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = new PublicKey(account)

      // Sign and send transaction
      const signed = await provider.signAndSendTransaction(transaction)
      const txHash = signed.signature

      console.log("[v0] Transaction sent:", txHash)
      setTransactionStatus({ status: "pending", hash: txHash })

      // Wait for confirmation
      await connection.confirmTransaction(txHash, "confirmed")

      console.log("[v0] Transaction confirmed:", txHash)
      setTransactionStatus({ status: "confirmed", hash: txHash })

      return txHash
    } catch (err: any) {
      console.error("[v0] Transaction error:", err)
      const errorMessage = err.message || "Transaction failed"
      setTransactionStatus({ status: "failed", error: errorMessage })
      throw new Error(errorMessage)
    }
  }

  const resetTransactionStatus = () => {
    setTransactionStatus({ status: "idle" })
  }

  const refreshBalance = async () => {
    if (account) {
      try {
        const provider = getPhantomProvider()
        if (!provider) {
          throw new Error("Phantom wallet not found")
        }

        const { Connection, PublicKey, LAMPORTS_PER_SOL } = await import("@solana/web3.js")
        const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed")

        const publicKey = new PublicKey(account)
        const balanceLamports = await connection.getBalance(publicKey)
        const balanceSOL = balanceLamports / LAMPORTS_PER_SOL

        setBalance(balanceSOL.toFixed(4))
        console.log("[v0] Balance refreshed:", balanceSOL, "SOL")
      } catch (error: any) {
        console.error("[v0] Error refreshing balance:", error?.message || error)
      }
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected,
        userProfile,
        transactionStatus,
        balance,
        connectWallet,
        disconnectWallet,
        updateUserProfile: updateProfile,
        openProfileModal,
        sendTransaction,
        resetTransactionStatus,
        refreshBalance,
      }}
    >
      {children}
      <WalletConnectionModal isOpen={modalOpen} status={connectionStatus} onClose={() => setModalOpen(false)} />
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleProfileSubmit}
      />
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

declare global {
  interface Window {
    phantom?: any
  }
}
