import {
  checkPaymentStatus,
  getPaymentStatusMessage,
} from "./services/blockchainChecker";
import { startPaymentMonitor } from "./services/paymentMonitor";
import { convertUsdToCrypto } from "./services/priceConverter";

async function testBlockchainChecker() {
  console.log("Testing Blockchain Checker...\n");
  console.log("=".repeat(60));

  // Simulate an order
  const orderId = "test-order-123";
  const usdAmount = 300;

  // Test with Bitcoin
  console.log("\n1. CHECKING BITCOIN PAYMENT (ONE-TIME CHECK)\n");

  const btcConversion = await convertUsdToCrypto(usdAmount, "BTC");
  const orderCreatedAt = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

  try {
    const btcResult = await checkPaymentStatus(
      "BTC",
      btcConversion.cryptoAmount,
      orderCreatedAt
    );

    console.log("\nResult:");
    console.log(`  Found: ${btcResult.found}`);
    console.log(`  Complete: ${btcResult.isComplete}`);
    console.log(`  Confirmations: ${btcResult.confirmations}`);
    console.log(`  Message: ${getPaymentStatusMessage(btcResult)}`);

    if (btcResult.transaction) {
      console.log("\n  Transaction Details:");
      console.log(`    Hash: ${btcResult.transaction.txHash}`);
      console.log(`    Amount: ${btcResult.transaction.amount} BTC`);
      console.log(`    From: ${btcResult.transaction.from}`);
      console.log(`    Status: ${btcResult.transaction.status}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }

  console.log("\n" + "=".repeat(60));

  // Test with Ethereum (mock)
  console.log("\n2. CHECKING ETHEREUM PAYMENT (ONE-TIME CHECK)\n");

  const ethConversion = await convertUsdToCrypto(usdAmount, "ETH");

  try {
    const ethResult = await checkPaymentStatus(
      "ETH",
      ethConversion.cryptoAmount,
      orderCreatedAt
    );

    console.log("\nResult:");
    console.log(`  Found: ${ethResult.found}`);
    console.log(`  Complete: ${ethResult.isComplete}`);
    console.log(`  Message: ${getPaymentStatusMessage(ethResult)}`);
  } catch (error) {
    console.error("Error:", error);
  }

  console.log("\n" + "=".repeat(60));

  // Demonstrate continuous monitoring
  console.log("\n3. PAYMENT MONITOR (CONTINUOUS CHECKING)\n");
  console.log(
    "This will check for payment every 30 seconds for 2 minutes...\n"
  );

  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // Expires in 2 minutes

  const monitor = startPaymentMonitor(
    orderId,
    "BTC",
    btcConversion.cryptoAmount,
    orderCreatedAt,
    expiresAt,
    (result, message) => {
      // This callback is called each time payment status is checked
      if (result.found) {
        console.log("🎉 PAYMENT DETECTED!");

        if (result.isComplete) {
          console.log("✅ PAYMENT CONFIRMED!");
          console.log("You can now mark the order as paid and send tickets!");
        } else {
          console.log(
            `⏳ Waiting for ${result.needsMoreConfirmations} more confirmation(s)...`
          );
        }
      }
    },
    30 // Check every 30 seconds
  );

  // Let it run for 2 minutes then stop
  setTimeout(() => {
    if (monitor.isRunning()) {
      console.log("\n⏱️  Test duration complete. Stopping monitor...");
      monitor.stop();
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ TEST COMPLETE\n");
    console.log("What we demonstrated:");
    console.log("  1. One-time payment check for Bitcoin");
    console.log("  2. One-time payment check for Ethereum");
    console.log("  3. Continuous monitoring with auto-updates");
    console.log("\nIn your real app:");
    console.log("  - Start monitor when user reaches checkout");
    console.log("  - Show live updates on the payment page");
    console.log("  - Stop monitor when payment confirmed or expired");
    console.log("  - Update order status in database when confirmed\n");

    process.exit(0);
  }, 2 * 60 * 1000); // 2 minutes

  console.log("Monitor is running... (This will take 2 minutes)");
  console.log("Press Ctrl+C to stop early.\n");
}

// Run the test
testBlockchainChecker().catch(console.error);
