"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { WalletConnectionModal } from "@/components/wallet-connection-modal"
import { UserProfileModal } from "@/components/user-profile-modal"
import { ProfileModal } from "@/components/profile-modal"
import { web3Provider } from "@/lib/web3-provider"
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

const getMetaMaskProvider = () => {
  if (typeof window === "undefined" || !window.ethereum) {
    return null
  }

  // If there are multiple providers, find MetaMask
  if (window.ethereum.providers?.length) {
    return window.ethereum.providers.find((p: any) => p.isMetaMask) || null
  }

  // Single provider - check if it's MetaMask
  return window.ethereum.isMetaMask ? window.ethereum : null
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
      console.log("[v0] Saving profile to Supabase:", { address, profile })
      const result = await updateUserProfileAction(address, {
        username: profile.name,
        email: profile.email,
        twitter: profile.twitter,
        avatar_url: profile.avatar || undefined,
      })

      if (result.success) {
        console.log("[v0] Profile saved to Supabase successfully for address:", address)
        setUserProfile(profile)
      } else {
        console.error("[v0] Failed to save profile to Supabase:", result.error)
      }
    } catch (error) {
      console.error("[v0] Error saving profile to Supabase:", error)
    }
  }

  useEffect(() => {
    const provider = getMetaMaskProvider()
    if (provider) {
      provider.on("accountsChanged", handleAccountsChanged)
      provider.on("chainChanged", handleChainChanged)

      return () => {
        provider.removeListener("accountsChanged", handleAccountsChanged)
        provider.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else if (accounts[0] !== account) {
      setAccount(accounts[0])
      setIsConnected(true)
      await loadProfileFromSupabase(accounts[0])
      refreshBalance()
    }
  }

  const handleChainChanged = (chainId: string) => {
    console.log("[v0] Chain changed to:", chainId)
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const provider = getMetaMaskProvider()
      if (provider) {
        const accounts = await provider.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
          await loadProfileFromSupabase(accounts[0])
          try {
            await web3Provider.initialize()
            await web3Provider.switchToBNBChain()
            const userBalance = await web3Provider.getBalance(accounts[0])
            setBalance(userBalance)
            console.log("[v0] User balance loaded on page refresh:", userBalance, "BNB")
          } catch (error) {
            console.error("[v0] Error initializing Web3Provider on page refresh:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }

  const connectWallet = async () => {
    try {
      const provider = getMetaMaskProvider()

      if (!provider) {
        alert("MetaMask is not installed! Please install MetaMask extension to connect your BNB wallet.")
        window.open("https://metamask.io/download/", "_blank")
        return
      }

      setModalOpen(true)
      setConnectionStatus("connecting")

      const accounts = await provider.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)

        const savedProfile = await loadProfileFromSupabase(accounts[0])

        try {
          await web3Provider.initialize()
          await web3Provider.switchToBNBChain()
          const userBalance = await web3Provider.getBalance(accounts[0])
          setBalance(userBalance)
          console.log("[v0] User balance:", userBalance, "BNB")
        } catch (error) {
          console.error("[v0] Error initializing Web3Provider:", error)
        }

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
    if (account) {
      await saveProfileToSupabase(account, profile)
    }
    console.log("[v0] User profile updated:", profile)
  }

  const disconnectWallet = () => {
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

      const provider = getMetaMaskProvider()
      if (!provider) {
        throw new Error("MetaMask is not installed")
      }

      setTransactionStatus({ status: "pending" })

      const amountInWei = BigInt(Math.floor(Number.parseFloat(amount) * 1e18)).toString(16)

      console.log("[v0] Sending transaction:", { to, amount, amountInWei })

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: to,
            value: `0x${amountInWei}`,
          },
        ],
      })

      console.log("[v0] Transaction sent:", txHash)
      setTransactionStatus({ status: "pending", hash: txHash })

      const receipt = await waitForTransaction(provider, txHash)

      if (receipt.status === "0x1" || receipt.status === 1) {
        console.log("[v0] Transaction confirmed:", txHash)
        setTransactionStatus({ status: "confirmed", hash: txHash })
      } else {
        throw new Error("Transaction failed")
      }

      return txHash
    } catch (err: any) {
      console.error("[v0] Transaction error:", err)
      const errorMessage = err.message || "Transaction failed"
      setTransactionStatus({ status: "failed", error: errorMessage })
      throw new Error(errorMessage)
    }
  }

  const waitForTransaction = async (provider: any, txHash: string, maxAttempts = 60): Promise<any> => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const receipt = await provider.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        })

        if (receipt !== null) {
          return receipt
        }

        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        console.error("[v0] Error checking transaction receipt:", error)
      }
    }

    throw new Error("Transaction confirmation timeout")
  }

  const resetTransactionStatus = () => {
    setTransactionStatus({ status: "idle" })
  }

  const refreshBalance = async () => {
    if (account) {
      try {
        if (!web3Provider.isInitialized()) {
          console.log("[v0] Initializing provider before getting balance")
          await web3Provider.initialize()
        }
        const userBalance = await web3Provider.getBalance(account)
        setBalance(userBalance)
        console.log("[v0] Balance refreshed:", userBalance, "BNB")
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
    ethereum?: any
  }
}
