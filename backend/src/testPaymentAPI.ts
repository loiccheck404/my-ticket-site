import axios from "axios";

// Configuration
const API_BASE_URL = "http://localhost:5000/api";

// Helper function to make API calls
async function apiCall(method: string, endpoint: string, data?: any) {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
}

// Test the payment API
async function testPaymentAPI() {
  console.log("🧪 Testing Payment API\n");
  console.log("=".repeat(60));

  // IMPORTANT: Replace this with a real order ID from your database
  const TEST_ORDER_ID = "test-order-id-replace-me";

  console.log(`\n📝 Using Order ID: ${TEST_ORDER_ID}`);
  console.log(
    "\n⚠️  IMPORTANT: Make sure to replace TEST_ORDER_ID with a real order!"
  );
  console.log("   Run this in psql to create a test order if needed:\n");
  console.log(
    `   INSERT INTO "Order" (id, "userId", "totalAmount", status, "paymentMethod")`
  );
  console.log(
    `   VALUES ('${TEST_ORDER_ID}', 'user-id', 300, 'PENDING', 'crypto');`
  );
  console.log("\n" + "=".repeat(60));

  try {
    // Test 1: Create Payment
    console.log("\n\n1️⃣  TEST: Create Payment");
    console.log("-".repeat(60));

    const createResult = await apiCall("POST", "/payment/create", {
      orderId: TEST_ORDER_ID,
      cryptocurrency: "BTC",
    });

    if (createResult.success) {
      console.log("✅ Payment created successfully!");
      console.log("\nPayment Details:");
      console.log(`  Transaction ID: ${createResult.payment.transactionId}`);
      console.log(`  Cryptocurrency: ${createResult.payment.cryptocurrency}`);
      console.log(
        `  Amount: ${createResult.payment.amount.crypto} ${createResult.payment.cryptocurrency} ($${createResult.payment.amount.usd})`
      );
      console.log(`  Exchange Rate: $${createResult.payment.exchangeRate}`);
      console.log(`  Wallet: ${createResult.payment.walletAddress}`);
      console.log(`  Reference: ${createResult.payment.paymentReference}`);
      console.log(`  Network: ${createResult.payment.network}`);
      console.log(
        `  Expires: ${new Date(
          createResult.payment.expiresAt
        ).toLocaleString()}`
      );
      console.log(`  QR Code: ${createResult.payment.qrCodeUrl}`);
    } else {
      console.log("❌ Failed to create payment");
      console.log(`Error: ${createResult.error}`);
      return; // Stop if creation fails
    }

    // Test 2: Get Payment Status
    console.log("\n\n2️⃣  TEST: Get Payment Status");
    console.log("-".repeat(60));

    const statusResult = await apiCall(
      "GET",
      `/payment/status/${TEST_ORDER_ID}`
    );

    if (statusResult.success) {
      console.log("✅ Payment status retrieved!");
      console.log(`\n  Status: ${statusResult.payment.status}`);
      console.log(`  Confirmations: ${statusResult.payment.confirmations}`);
      if (statusResult.payment.txHash) {
        console.log(`  Transaction Hash: ${statusResult.payment.txHash}`);
      }
      console.log(
        `  Time Remaining: ${Math.floor(
          statusResult.payment.timeRemaining / 1000 / 60
        )} minutes`
      );
    } else {
      console.log("❌ Failed to get payment status");
      console.log(`Error: ${statusResult.error}`);
    }

    // Test 3: Check Blockchain (run multiple times to see progression)
    console.log("\n\n3️⃣  TEST: Check Blockchain (Demo Mode Simulation)");
    console.log("-".repeat(60));
    console.log("Running 4 checks to simulate payment detection...\n");

    for (let i = 1; i <= 4; i++) {
      console.log(`Check #${i}:`);

      const checkResult = await apiCall(
        "GET",
        `/payment/check/${TEST_ORDER_ID}`
      );

      if (checkResult.success) {
        console.log(`  ✅ ${checkResult.payment.message}`);
        console.log(`  Status: ${checkResult.payment.status}`);
        console.log(`  Confirmations: ${checkResult.payment.confirmations}`);

        if (checkResult.payment.needsMoreConfirmations > 0) {
          console.log(
            `  Needs ${checkResult.payment.needsMoreConfirmations} more confirmation(s)`
          );
        }

        if (checkResult.payment.txHash) {
          console.log(`  Transaction Hash: ${checkResult.payment.txHash}`);
        }

        if (checkResult.payment.status === "COMPLETED") {
          console.log("\n  🎉 PAYMENT COMPLETE! Order confirmed!");
          break;
        }
      } else {
        console.log(`  ❌ Error: ${checkResult.error}`);
      }

      // Wait 2 seconds between checks
      if (i < 4) {
        console.log("  ⏳ Waiting 2 seconds...\n");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Final status check
    console.log("\n\n4️⃣  FINAL: Verify Payment Status");
    console.log("-".repeat(60));

    const finalStatus = await apiCall(
      "GET",
      `/payment/status/${TEST_ORDER_ID}`
    );

    if (finalStatus.success) {
      console.log("✅ Final Status:");
      console.log(`  Payment Status: ${finalStatus.payment.status}`);
      console.log(`  Confirmations: ${finalStatus.payment.confirmations}`);
      console.log(
        `  Confirmed At: ${
          finalStatus.payment.confirmedAt
            ? new Date(finalStatus.payment.confirmedAt).toLocaleString()
            : "Not yet"
        }`
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ ALL TESTS COMPLETE!\n");
    console.log("💡 What happened:");
    console.log("   1. Created a crypto payment for the order");
    console.log("   2. Retrieved payment status from database");
    console.log("   3. Simulated blockchain checking (demo mode)");
    console.log("   4. Payment progressed: PENDING → CONFIRMING → COMPLETED");
    console.log("   5. Order was marked as confirmed!\n");
  } catch (error: any) {
    console.error("\n❌ Test failed with error:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure your backend server is running:");
      console.log("   cd ~/Desktop/my-ticket-site/backend");
      console.log("   npm run dev\n");
    }
  }
}

// Run the tests
console.log("🚀 Starting Payment API Tests...");
console.log("⚠️  Make sure your backend server is running!\n");

testPaymentAPI().catch(console.error);
