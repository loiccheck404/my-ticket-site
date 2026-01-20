"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentReference = generatePaymentReference;
exports.calculateExpirationTime = calculateExpirationTime;
exports.generatePaymentDetails = generatePaymentDetails;
exports.formatPaymentInstructions = formatPaymentInstructions;
exports.isValidPaymentReference = isValidPaymentReference;
exports.extractOrderIdFromReference = extractOrderIdFromReference;
const crypto_1 = __importDefault(require("crypto"));
const walletConfig_1 = require("../config/walletConfig");
/**
 * Generate a unique payment reference for an order
 * Format: ORDER-{orderId}-{timestamp}-{random}
 * Example: ORDER-abc123-1699564800-x7k2
 */
function generatePaymentReference(orderId) {
    const timestamp = Date.now();
    const randomPart = crypto_1.default.randomBytes(2).toString("hex"); // 4 character random string
    return `ORDER-${orderId}-${timestamp}-${randomPart}`;
}
/**
 * Calculate payment expiration time
 */
function calculateExpirationTime() {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + walletConfig_1.PAYMENT_TIMEOUT_MINUTES);
    return expiresAt;
}
/**
 * Generate complete payment details for an order
 * This is the main function you'll call when creating a payment
 */
function generatePaymentDetails(orderId, usdAmount, cryptoAmount, exchangeRate, cryptocurrency) {
    // Get the master wallet address for this cryptocurrency
    const walletConfig = walletConfig_1.WALLET_ADDRESSES[cryptocurrency];
    if (!walletConfig) {
        throw new Error(`Wallet not configured for ${cryptocurrency}`);
    }
    // Generate unique payment reference
    const paymentReference = generatePaymentReference(orderId);
    // Calculate expiration time
    const expiresAt = calculateExpirationTime();
    // Generate QR code URL
    const qrCodeUrl = (0, walletConfig_1.getQRCodeUrl)(walletConfig.address, cryptoAmount, cryptocurrency);
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
function formatPaymentInstructions(details) {
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
function isValidPaymentReference(reference) {
    // Format: ORDER-{orderId}-{timestamp}-{random}
    const pattern = /^ORDER-[a-zA-Z0-9-]+-\d+-[a-f0-9]{4}$/;
    return pattern.test(reference);
}
/**
 * Extract order ID from payment reference
 */
function extractOrderIdFromReference(reference) {
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
