"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Web3ContextType {
  account: string | null
  isConnecting: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  sendTransaction: (to: string, amount: string) => Promise<string>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", () => window.location.reload())

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null)
    } else {
      setAccount(accounts[0])
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        return
      }

      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        setAccount(accounts[0])
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err)
    }
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.")
      }

      setAccount(accounts[0])

      // Check if we're on BSC network (chainId: 0x38 for mainnet, 0x61 for testnet)
      const chainId = await window.ethereum.request({ method: "eth_chainId" })

      // BSC Mainnet: 0x38 (56), BSC Testnet: 0x61 (97)
      if (chainId !== "0x38" && chainId !== "0x61") {
        // Try to switch to BSC Mainnet
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x38" }],
          })
        } catch (switchError: any) {
          // If the chain hasn't been added to MetaMask, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x38",
                  chainName: "BNB Smart Chain",
                  nativeCurrency: {
                    name: "BNB",
                    symbol: "BNB",
                    decimals: 18,
                  },
                  rpcUrls: ["https://bsc-dataseed.binance.org/"],
                  blockExplorerUrls: ["https://bscscan.com/"],
                },
              ],
            })
          } else {
            throw switchError
          }
        }
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      setError(err.message || "Failed to connect wallet")
      setAccount(null)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setError(null)
  }

  const sendTransaction = async (to: string, amount: string): Promise<string> => {
    try {
      if (!account) {
        throw new Error("No wallet connected")
      }

      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is not installed")
      }

      // Convert amount to Wei (1 BNB = 10^18 Wei)
      const amountInWei = (Number.parseFloat(amount) * 1e18).toString(16)

      // Send transaction
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: to,
            value: `0x${amountInWei}`,
          },
        ],
      })

      return txHash
    } catch (err: any) {
      console.error("Error sending transaction:", err)
      throw new Error(err.message || "Transaction failed")
    }
  }

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        sendTransaction,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
