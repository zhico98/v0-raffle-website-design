import { ethers } from "ethers"

export class Web3Provider {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null
  private initialized = false

  async initialize() {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed")
    }

    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.signer = await this.provider.getSigner()
    this.initialized = true

    return this
  }

  isInitialized(): boolean {
    return this.initialized
  }

  getProvider() {
    if (!this.provider) {
      throw new Error("Provider not initialized")
    }
    return this.provider
  }

  getSigner() {
    if (!this.signer) {
      throw new Error("Signer not initialized")
    }
    return this.signer
  }

  async getBalance(address: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize()
    }

    if (!this.provider) {
      throw new Error("Provider not initialized")
    }

    const balance = await this.provider.getBalance(address)
    return ethers.formatEther(balance)
  }

  async getNetwork() {
    if (!this.provider) {
      throw new Error("Provider not initialized")
    }

    return await this.provider.getNetwork()
  }

  async switchToBNBChain() {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed")
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x38" }],
      })
    } catch (switchError: any) {
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
}

export const web3Provider = new Web3Provider()
