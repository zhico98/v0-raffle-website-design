// Solana Configuration
export const BLOCKCHAIN_CONFIG = {
  chainId: 101, // Solana Mainnet
  chainIdHex: "0x65",
  chainName: "Solana",
  nativeCurrency: {
    name: "SOL",
    symbol: "SOL",
    decimals: 9, // Solana uses 9 decimals
  },
  rpcUrls: ["https://api.mainnet-beta.solana.com/"],
  blockExplorerUrls: ["https://solscan.io/"],
}

// Raffle Contract Configuration
export const RAFFLE_CONTRACT = {
  // This will be your deployed smart contract address
  address: process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS || "11111111111111111111111111111111",

  // Raffle settings
  ticketPrice: "0.1", // 0.1 SOL per ticket
  maxTicketsPerUser: 100,
  raffleDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
}

// Contract ABI - This is a simplified version
// You'll need to replace this with your actual contract ABI after deployment
export const RAFFLE_ABI = [
  "function enterRaffle(uint256 raffleId, uint256 ticketCount) payable",
  "function getRaffleInfo(uint256 raffleId) view returns (uint256 totalTickets, uint256 prizePool, address winner, bool isActive)",
  "function getUserTickets(uint256 raffleId, address user) view returns (uint256)",
  "function drawWinner(uint256 raffleId) returns (address)",
  "event RaffleEntered(uint256 indexed raffleId, address indexed user, uint256 ticketCount)",
  "event WinnerDrawn(uint256 indexed raffleId, address indexed winner, uint256 prizeAmount)",
]
