import type { ProductPrice } from "@/types/product-prices";

/**
 * Get the price for a specific quantity from a list of price tiers
 * @param prices Array of price tiers
 * @param quantity Desired quantity
 * @returns The price per unit for the given quantity, or null if no matching tier found
 */
export function getPriceForQuantity(
  prices: ProductPrice[],
  quantity: number
): number | null {
  if (!prices || prices.length === 0) return null;

  // Sort prices by max_qty ascending to find the first tier that can accommodate the quantity
  const sortedPrices = [...prices].sort((a, b) => a.max_qty - b.max_qty);

  // Find the first tier where quantity <= max_qty
  const matchingTier = sortedPrices.find((price) => quantity <= price.max_qty);

  return matchingTier ? matchingTier.price : null;
}

/**
 * Calculate total cost for a specific quantity
 * @param prices Array of price tiers
 * @param quantity Desired quantity
 * @returns Total cost for the quantity, or null if no matching tier found
 */
export function getTotalCost(
  prices: ProductPrice[],
  quantity: number
): number | null {
  const unitPrice = getPriceForQuantity(prices, quantity);
  return unitPrice ? unitPrice * quantity : null;
}

/**
 * Get the best available price (lowest price tier)
 * @param prices Array of price tiers
 * @returns The lowest price available, or null if no prices
 */
export function getBestPrice(prices: ProductPrice[]): number | null {
  if (!prices || prices.length === 0) return null;

  return Math.min(...prices.map((price) => price.price));
}

/**
 * Get the quantity range for a specific price tier
 * @param prices Array of price tiers
 * @param targetPrice The price to find the range for
 * @returns Object with min and max quantity for the price tier
 */
export function getQuantityRangeForPrice(
  prices: ProductPrice[],
  targetPrice: number
): { min: number; max: number } | null {
  if (!prices || prices.length === 0) return null;

  const matchingTier = prices.find((price) => price.price === targetPrice);
  if (!matchingTier) return null;

  // Sort prices to find the previous tier
  const sortedPrices = [...prices].sort((a, b) => a.max_qty - b.max_qty);
  const tierIndex = sortedPrices.findIndex(
    (price) => price.price === targetPrice
  );

  const min = tierIndex > 0 ? sortedPrices[tierIndex - 1].max_qty + 1 : 1;
  const max = matchingTier.max_qty;

  return { min, max };
}

/**
 * Format price with currency symbol
 * @param price Price to format
 * @param currency Currency symbol (default: $)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = "$"): string {
  return `${currency}${price.toFixed(2)}`;
}

/**
 * Generate a price summary string for display
 * @param prices Array of price tiers
 * @returns Human-readable price summary
 */
export function generatePriceSummary(prices: ProductPrice[]): string {
  if (!prices || prices.length === 0) return "No pricing available";

  if (prices.length === 1) {
    return `${formatPrice(prices[0].price)} (up to ${prices[0].max_qty} units)`;
  }

  const sortedPrices = [...prices].sort((a, b) => a.max_qty - b.max_qty);
  const bestPrice = getBestPrice(prices);
  const startingPrice = sortedPrices[0].price;

  if (bestPrice === startingPrice) {
    return `${formatPrice(startingPrice)} (${prices.length} price tiers)`;
  }

  return `${formatPrice(startingPrice)} - ${formatPrice(bestPrice!)} (${
    prices.length
  } price tiers)`;
}
