import axios from "axios";
import { CryptoType } from "./priceConverter";
import {
  WALLET_ADDRESSES,
  REQUIRED_CONFIRMATIONS,
} from "../config/walletConfig";

export interface Transaction {
  txHash: string;
  amount: number;
  cryptocurrency: CryptoType;
  confirmations: number;
  timestamp: Date;
  from: string;
  to: string;
  status: "pending" | "confirmed" | "failed";
}

export interface PaymentCheckResult {
  found: boolean;
  transaction?: Transaction;
  expectedAmount: number;
  receivedAmount?: number;
  isComplete: boolean;
  confirmations: number;
  needsMoreConfirmations: number;
}

/**
 * Check if payment was received for Bitcoin (testnet)
 * Uses BlockCypher API (free, no API key needed for low usage)
 */
async function checkBitcoinPayment(
  walletAddress: string,
  expectedAmount: number,
  sinceTimestamp: Date
): Promise<PaymentCheckResult> {
  try {
    // BlockCypher API for Bitcoin testnet
    const response = await axios.get(
      `https://api.blockcypher.com/v1/btc/test3/addrs/${walletAddress}/full?limit=10`
    );

    const transactions = response.data.txs || [];

    // Look for transactions after the order was created
    for (const tx of transactions) {
      const txDate = new Date(tx.received);

      if (txDate < sinceTimestamp) {
        continue; // Skip old transactions
      }

      // Calculate amount received (sum of outputs to our address)
      let receivedAmount = 0;
      for (const output of tx.outputs || []) {
        if (output.addresses && output.addresses.includes(walletAddress)) {
          receivedAmount += output.value / 100000000; // Convert satoshis to BTC
        }
      }

      // Check if amount matches (with 0.1% tolerance for fees)
      const tolerance = expectedAmount * 0.001;
      if (Math.abs(receivedAmount - expectedAmount) <= tolerance) {
        const confirmations = tx.confirmations || 0;
        const requiredConfs = REQUIRED_CONFIRMATIONS.BTC;

        return {
          found: true,
          transaction: {
            txHash: tx.hash,
            amount: receivedAmount,
            cryptocurrency: "BTC",
            confirmations,
            timestamp: txDate,
            from: tx.inputs[0]?.addresses?.[0] || "unknown",
            to: walletAddress,
            status: confirmations >= requiredConfs ? "confirmed" : "pending",
          },
          expectedAmount,
          receivedAmount,
          isComplete: confirmations >= requiredConfs,
          confirmations,
          needsMoreConfirmations: Math.max(0, requiredConfs - confirmations),
        };
      }
    }

    return {
      found: false,
      expectedAmount,
      isComplete: false,
      confirmations: 0,
      needsMoreConfirmations: REQUIRED_CONFIRMATIONS.BTC,
    };
  } catch (error) {
    console.error("Error checking Bitcoin payment:", error);
    throw new Error("Failed to check Bitcoin payment");
  }
}

/**
 * Check if payment was received for Ethereum/USDT (testnet)
 * Uses Etherscan API for Sepolia testnet
 *
 * Note: For production, you'd need an Etherscan API key
 * For now, this uses a mock/fallback for testnet
 */
async function checkEthereumPayment(
  walletAddress: string,
  expectedAmount: number,
  cryptocurrency: CryptoType,
  sinceTimestamp: Date
): Promise<PaymentCheckResult> {
  try {
    // For testnet demo purposes, we'll use a simplified check
    // In production, you'd use Etherscan API or Infura to check actual blockchain

    console.log(`Checking ${cryptocurrency} payment for ${walletAddress}`);
    console.log(`Expected amount: ${expectedAmount} ${cryptocurrency}`);
    console.log(`Checking transactions since: ${sinceTimestamp.toISOString()}`);

    // TESTNET SIMULATION
    // In a real implementation, you would:
    // 1. Call Etherscan API: https://api-sepolia.etherscan.io/api
    // 2. Get list of transactions for the address
    // 3. Check each transaction for matching amount
    // 4. Verify confirmations

    // For now, return "not found" to indicate we're waiting for payment
    return {
      found: false,
      expectedAmount,
      isComplete: false,
      confirmations: 0,
      needsMoreConfirmations: REQUIRED_CONFIRMATIONS.ETH,
    };
  } catch (error) {
    console.error(`Error checking ${cryptocurrency} payment:`, error);
    throw new Error(`Failed to check ${cryptocurrency} payment`);
  }
}

/**
 * Main function to check if payment was received for an order
 * This is what you'll call from your API routes
 */
export async function checkPaymentStatus(
  cryptocurrency: CryptoType,
  expectedAmount: number,
  createdAt: Date
): Promise<PaymentCheckResult> {
  const walletConfig = WALLET_ADDRESSES[cryptocurrency];

  if (!walletConfig) {
    throw new Error(`Wallet not configured for ${cryptocurrency}`);
  }

  const walletAddress = walletConfig.address;

  console.log(`\n🔍 Checking payment status...`);
  console.log(`Cryptocurrency: ${cryptocurrency}`);
  console.log(`Wallet: ${walletAddress}`);
  console.log(`Expected: ${expectedAmount} ${cryptocurrency}`);

  if (cryptocurrency === "BTC") {
    return await checkBitcoinPayment(walletAddress, expectedAmount, createdAt);
  } else {
    // ETH or USDT (both use Ethereum network)
    return await checkEthereumPayment(
      walletAddress,
      expectedAmount,
      cryptocurrency,
      createdAt
    );
  }
}

/**
 * Helper function to determine if we should continue checking
 * Returns true if payment is still pending and hasn't expired
 */
export function shouldContinueChecking(
  expiresAt: Date,
  paymentResult: PaymentCheckResult
): boolean {
  const now = new Date();

  // Stop if payment is complete
  if (paymentResult.isComplete) {
    return false;
  }

  // Stop if expired
  if (now > expiresAt) {
    return false;
  }

  // Continue checking
  return true;
}

/**
 * Get a human-readable status message
 */
export function getPaymentStatusMessage(result: PaymentCheckResult): string {
  if (!result.found) {
    return "Waiting for payment... No transaction found yet.";
  }

  if (result.isComplete) {
    return `Payment confirmed! ${result.confirmations} confirmations.`;
  }

  return `Payment received! Waiting for ${result.needsMoreConfirmations} more confirmation(s). Current: ${result.confirmations}`;
}
