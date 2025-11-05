import crypto from "crypto";
import {
  WALLET_ADDRESSES,
  PAYMENT_TIMEOUT_MINUTES,
  getQRCodeUrl,
} from "../config/walletConfig";
import { CryptoType } from "./priceConverter";

export interface PaymentDetails {
  // Wallet information
  walletAddress: string;
  cryptocurrency: CryptoType;
  network: "testnet" | "mainnet";

  // Payment amounts
  usdAmount: number;
  cryptoAmount: number;
  exchangeRate: number;

  // Tracking
  paymentReference: string; // Unique reference for this payment
  orderId: string;

  // Expiration
  expiresAt: Date;

  // QR Code
  qrCodeUrl: string;
}

/**
 * Generate a unique payment reference for an order
 * Format: ORDER-{orderId}-{timestamp}-{random}
 * Example: ORDER-abc123-1699564800-x7k2
 */
export function generatePaymentReference(orderId: string): string {
  const timestamp = Date.now();
  const randomPart = crypto.randomBytes(2).toString("hex"); // 4 character random string
  return `ORDER-${orderId}-${timestamp}-${randomPart}`;
}

/**
 * Calculate payment expiration time
 */
export function calculateExpirationTime(): Date {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + PAYMENT_TIMEOUT_MINUTES);
  return expiresAt;
}

/**
 * Generate complete payment details for an order
 * This is the main function you'll call when creating a payment
 */
export function generatePaymentDetails(
  orderId: string,
  usdAmount: number,
  cryptoAmount: number,
  exchangeRate: number,
  cryptocurrency: CryptoType
): PaymentDetails {
  // Get the master wallet address for this cryptocurrency
  const walletConfig = WALLET_ADDRESSES[cryptocurrency];

  if (!walletConfig) {
    throw new Error(`Wallet not configured for ${cryptocurrency}`);
  }

  // Generate unique payment reference
  const paymentReference = generatePaymentReference(orderId);

  // Calculate expiration time
  const expiresAt = calculateExpirationTime();

  // Generate QR code URL
  const qrCodeUrl = getQRCodeUrl(
    walletConfig.address,
    cryptoAmount,
    cryptocurrency
  );

  return {
    walletAddress: walletConfig.address,
    cryptocurrency,
    network: walletConfig.network,
    usdAmount,
    cryptoAmount,
    exchangeRate,
    paymentReference,
    orderId,
    expiresAt,
    qrCodeUrl,
  };
}

/**
 * Format payment instructions for display
 */
export function formatPaymentInstructions(details: PaymentDetails): string {
  return `
Payment Instructions:
--------------------
Amount: ${details.cryptoAmount} ${details.cryptocurrency}
Wallet Address: ${details.walletAddress}
Payment Reference: ${details.paymentReference}
Network: ${details.network}
Expires: ${details.expiresAt.toLocaleString()}

IMPORTANT: Include the payment reference in your transaction memo/note!
This helps us identify your payment.
  `.trim();
}

/**
 * Validate payment reference format
 */
export function isValidPaymentReference(reference: string): boolean {
  // Format: ORDER-{orderId}-{timestamp}-{random}
  const pattern = /^ORDER-[a-zA-Z0-9-]+-\d+-[a-f0-9]{4}$/;
  return pattern.test(reference);
}

/**
 * Extract order ID from payment reference
 */
export function extractOrderIdFromReference(reference: string): string | null {
  if (!isValidPaymentReference(reference)) {
    return null;
  }

  // Split by '-' and get the order ID part (between first and second dash, up to timestamp)
  const parts = reference.split("-");
  if (parts.length >= 3) {
    // Remove 'ORDER' prefix and timestamp/random suffix
    return parts.slice(1, -2).join("-");
  }

  return null;
}
