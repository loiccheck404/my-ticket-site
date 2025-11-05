import {
  generatePaymentDetails,
  formatPaymentInstructions,
  isValidPaymentReference,
  extractOrderIdFromReference,
} from "./services/walletGenerator";
import { convertUsdToCrypto } from "./services/priceConverter";

// Test the wallet generator
async function testWalletGenerator() {
  console.log("Testing Wallet Generator...\n");
  console.log("=".repeat(50));

  // Simulate an order
  const orderId = "abc123def456";
  const usdAmount = 300; // $300 for tickets

  // Test with Bitcoin
  console.log("\n1. GENERATING BITCOIN PAYMENT\n");

  const btcConversion = await convertUsdToCrypto(usdAmount, "BTC");
  const btcPayment = generatePaymentDetails(
    orderId,
    usdAmount,
    btcConversion.cryptoAmount,
    btcConversion.exchangeRate,
    "BTC"
  );

  console.log("Payment Details:");
  console.log(`  Order ID: ${btcPayment.orderId}`);
  console.log(
    `  Amount: ${btcPayment.cryptoAmount} BTC ($${btcPayment.usdAmount})`
  );
  console.log(`  Wallet: ${btcPayment.walletAddress}`);
  console.log(`  Reference: ${btcPayment.paymentReference}`);
  console.log(`  Network: ${btcPayment.network}`);
  console.log(`  Expires: ${btcPayment.expiresAt.toLocaleString()}`);
  console.log(`  QR Code: ${btcPayment.qrCodeUrl}`);

  console.log("\n" + formatPaymentInstructions(btcPayment));

  // Test with Ethereum
  console.log("\n" + "=".repeat(50));
  console.log("\n2. GENERATING ETHEREUM PAYMENT\n");

  const ethConversion = await convertUsdToCrypto(usdAmount, "ETH");
  const ethPayment = generatePaymentDetails(
    orderId,
    usdAmount,
    ethConversion.cryptoAmount,
    ethConversion.exchangeRate,
    "ETH"
  );

  console.log("Payment Details:");
  console.log(`  Order ID: ${ethPayment.orderId}`);
  console.log(
    `  Amount: ${ethPayment.cryptoAmount} ETH ($${ethPayment.usdAmount})`
  );
  console.log(`  Wallet: ${ethPayment.walletAddress}`);
  console.log(`  Reference: ${ethPayment.paymentReference}`);

  // Test with USDT
  console.log("\n" + "=".repeat(50));
  console.log("\n3. GENERATING USDT PAYMENT\n");

  const usdtConversion = await convertUsdToCrypto(usdAmount, "USDT");
  const usdtPayment = generatePaymentDetails(
    orderId,
    usdAmount,
    usdtConversion.cryptoAmount,
    usdtConversion.exchangeRate,
    "USDT"
  );

  console.log("Payment Details:");
  console.log(`  Order ID: ${usdtPayment.orderId}`);
  console.log(
    `  Amount: ${usdtPayment.cryptoAmount} USDT ($${usdtPayment.usdAmount})`
  );
  console.log(`  Wallet: ${usdtPayment.walletAddress}`);
  console.log(`  Reference: ${usdtPayment.paymentReference}`);

  // Test reference validation
  console.log("\n" + "=".repeat(50));
  console.log("\n4. TESTING PAYMENT REFERENCE VALIDATION\n");

  const validRef = btcPayment.paymentReference;
  const invalidRef = "INVALID-REF-123";

  console.log(
    `Valid reference "${validRef}": ${isValidPaymentReference(validRef)}`
  );
  console.log(
    `Invalid reference "${invalidRef}": ${isValidPaymentReference(invalidRef)}`
  );

  const extractedOrderId = extractOrderIdFromReference(validRef);
  console.log(`\nExtracted Order ID from reference: ${extractedOrderId}`);
  console.log(`Matches original Order ID: ${extractedOrderId === orderId}`);
}

// Run the test
testWalletGenerator().catch(console.error);
