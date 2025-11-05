// Master wallet addresses for receiving crypto payments
// In production, you would use your real wallet addresses
// For testnet, these are example addresses

export interface WalletConfig {
  address: string;
  network: "testnet" | "mainnet";
  qrCodeUrl?: string;
}

export const WALLET_ADDRESSES: Record<string, WalletConfig> = {
  BTC: {
    address: "tb1q9pvjqz5u5sdgpatg3wn0ce438u5cyv85lly0pc", // Bitcoin testnet address (valid)
    network: "testnet",
  },
  ETH: {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Ethereum testnet address (Sepolia)
    network: "testnet",
  },
  USDT: {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // USDT on Ethereum testnet (same as ETH)
    network: "testnet",
  },
};

// Payment timeout duration (30 minutes)
export const PAYMENT_TIMEOUT_MINUTES = 30;

// Demo mode: Set to true to simulate payments without hitting real blockchain APIs
// Useful for testing when APIs are blocked or for school demonstrations
export const DEMO_MODE = true;

// Minimum confirmations required before marking payment as complete
export const REQUIRED_CONFIRMATIONS: Record<string, number> = {
  BTC: 1, // 1 confirmation for Bitcoin (about 10 minutes)
  ETH: 12, // 12 confirmations for Ethereum (about 3 minutes)
  USDT: 12, // Same as ETH since USDT runs on Ethereum
};

// Generate QR code URL for payment
export function getQRCodeUrl(
  address: string,
  amount: number,
  crypto: string
): string {
  // Using a free QR code API
  const paymentUri =
    crypto === "BTC"
      ? `bitcoin:${address}?amount=${amount}`
      : `ethereum:${address}?value=${amount}`;

  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    paymentUri
  )}`;
}
