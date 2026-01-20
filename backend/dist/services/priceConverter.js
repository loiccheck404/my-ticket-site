"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCryptoPrice = getCryptoPrice;
exports.convertUsdToCrypto = convertUsdToCrypto;
exports.formatCryptoAmount = formatCryptoAmount;
exports.formatUsdAmount = formatUsdAmount;
const axios_1 = __importDefault(require("axios"));
// Cache prices for 1 minute to avoid too many API calls
const priceCache = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds
/**
 * Get current price of a cryptocurrency in USD
 * Uses CoinGecko API (free, no API key needed)
 */
async function getCryptoPrice(crypto) {
    // Check if we have a recent cached price
    const cached = priceCache.get(crypto);
    if (cached && Date.now() - cached.lastUpdated.getTime() < CACHE_DURATION) {
        console.log(`Using cached price for ${crypto}: $${cached.usd}`);
        return cached.usd;
    }
    try {
        // Map crypto symbols to CoinGecko IDs
        const coinIds = {
            BTC: "bitcoin",
            ETH: "ethereum",
            USDT: "tether",
        };
        const coinId = coinIds[crypto];
        // Fetch current price from CoinGecko
        const response = await axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        const price = response.data[coinId].usd;
        // Cache the price
        priceCache.set(crypto, {
            usd: price,
            lastUpdated: new Date(),
        });
        console.log(`Fetched fresh price for ${crypto}: $${price}`);
        return price;
    }
    catch (error) {
        console.error(`Error fetching ${crypto} price:`, error);
        // Return fallback prices for testnet (these are approximate)
        const fallbackPrices = {
            BTC: 60000,
            ETH: 3000,
            USDT: 1,
        };
        console.log(`Using fallback price for ${crypto}: $${fallbackPrices[crypto]}`);
        return fallbackPrices[crypto];
    }
}
/**
 * Convert USD amount to cryptocurrency amount
 * Example: convertUsdToCrypto(300, 'BTC') might return 0.005
 */
async function convertUsdToCrypto(usdAmount, crypto) {
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
function formatCryptoAmount(amount, crypto) {
    const decimals = crypto === "USDT" ? 2 : 8;
    return `${amount.toFixed(decimals)} ${crypto}`;
}
/**
 * Format USD amount for display
 * Example: formatUsdAmount(300) returns "$300.00"
 */
function formatUsdAmount(amount) {
    return `$${amount.toFixed(2)}`;
}
