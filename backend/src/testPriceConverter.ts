import {
  convertUsdToCrypto,
  formatCryptoAmount,
  formatUsdAmount,
  CryptoType,
} from "./services/priceConverter";

// Test the price converter
async function testPriceConverter() {
  console.log("Testing Price Converter...\n");

  const testAmount = 300; // $300 USD
  const cryptos: CryptoType[] = ["BTC", "ETH", "USDT"];

  console.log(`Converting ${formatUsdAmount(testAmount)} to crypto:\n`);

  for (const crypto of cryptos) {
    try {
      const result = await convertUsdToCrypto(testAmount, crypto);

      console.log(`${crypto}:`);
      console.log(
        `  Exchange Rate: ${formatUsdAmount(result.exchangeRate)} per ${crypto}`
      );
      console.log(
        `  Amount: ${formatCryptoAmount(result.cryptoAmount, crypto)}`
      );
      console.log("");
    } catch (error) {
      console.error(`Error converting to ${crypto}:`, error);
    }
  }
}

// Run the test
testPriceConverter();
