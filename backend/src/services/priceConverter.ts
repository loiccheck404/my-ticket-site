import axios from "axios";

// Supported cryptocurrencies
export type CryptoType = "BTC" | "ETH" | "USDT";

// Price data structure
interface CryptoPrice {
  usd: number;
  lastUpdated: Date;
}

// Cache prices for 1 minute to avoid too many API calls
const priceCache = new Map<CryptoType, CryptoPrice>();
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds

/**
 * Get current price of a cryptocurrency in USD
 * Uses CoinGecko API (free, no API key needed)
 */
export async function getCryptoPrice(crypto: CryptoType): Promise<number> {
  // Check if we have a recent cached price
  const cached = priceCache.get(crypto);
  if (cached && Date.now() - cached.lastUpdated.getTime() < CACHE_DURATION) {
    console.log(`Using cached price for ${crypto}: $${cached.usd}`);
    return cached.usd;
  }

  try {
    // Map crypto symbols to CoinGecko IDs
    const coinIds: Record<CryptoType, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      USDT: "tether",
    };

    const coinId = coinIds[crypto];

    // Fetch current price from CoinGecko
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );

    const price = response.data[coinId].usd;

    // Cache the price
    priceCache.set(crypto, {
      usd: price,
      lastUpdated: new Date(),
    });

    console.log(`Fetched fresh price for ${crypto}: $${price}`);
    return price;
  } catch (error) {
    console.error(`Error fetching ${crypto} price:`, error);

    // Return fallback prices for testnet (these are approximate)
    const fallbackPrices: Record<CryptoType, number> = {
      BTC: 60000,
      ETH: 3000,
      USDT: 1,
    };

    console.log(
      `Using fallback price for ${crypto}: $${fallbackPrices[crypto]}`
    );
    return fallbackPrices[crypto];
  }
}

/**
 * Convert USD amount to cryptocurrency amount
 * Example: convertUsdToCrypto(300, 'BTC') might return 0.005
 */
export async function convertUsdToCrypto(
  usdAmount: number,
  crypto: CryptoType
): Promise<{ cryptoAmount: number; exchangeRate: number }> {
  const exchangeRate = await getCryptoPrice(crypto);
  const cryptoAmount = usdAmount / exchangeRate;

  // Round to appropriate decimal places
  const decimals = crypto === "USDT" ? 2 : 8; // USDT uses 2 decimals, BTC/ETH use 8
  const roundedAmount = Number(cryptoAmount.toFixed(decimals));

  return {
    cryptoAmount: roundedAmount,
    exchangeRate,
  };
}

/**
 * Format crypto amount for display
 * Example: formatCryptoAmount(0.005, 'BTC') returns "0.005 BTC"
 */
export function formatCryptoAmount(amount: number, crypto: CryptoType): string {
  const decimals = crypto === "USDT" ? 2 : 8;
  return `${amount.toFixed(decimals)} ${crypto}`;
}

/**
 * Format USD amount for display
 * Example: formatUsdAmount(300) returns "$300.00"
 */
export function formatUsdAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
