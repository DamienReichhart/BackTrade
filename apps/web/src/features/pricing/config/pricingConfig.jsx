/**
 * Pricing configuration
 *
 * Defines pricing tiers, features, and comparison data
 * Merged with API data to display complete pricing information
 */

/**
 * Pricing tiers configuration
 */
export const pricingTiers = [
  {
    code: "FREE",
    name: "Free",
    price: 0,
    currency: "€",
    period: "/month",
    description: "For individuals getting started",
    features: [
      { text: "1 concurrent session", included: true },
      { text: "Basic instruments (3)", included: true },
      {
        text: "Standard execution (spread, slippage, commission)",
        included: true
      },
      { text: "Session reports", included: true }
    ],
    ctaText: "Start free",
    ctaVariant: "outline"
  },
  {
    code: "TRADER",
    name: "Trader",
    price: 19,
    currency: "€",
    period: "/month",
    description: "For serious traders",
    badge: "Popular",
    badgeVariant: "primary",
    features: [
      { text: "5 concurrent sessions", included: true },
      { text: "All instruments", included: true },
      { text: "Advanced session analytics", included: true }
    ],
    ctaText: "Get started",
    ctaVariant: "primary",
    highlighted: true
  },
  {
    code: "EXPERT",
    name: "Expert",
    price: 49,
    currency: "€",
    period: "/month",
    description: "For professionals",
    features: [
      { text: "Unlimited sessions", included: true },
      { text: "Priority support", included: true }
    ],
    ctaText: "Go expert",
    ctaVariant: "outline"
  }
];

/**
 * Comparison table data
 */
export const comparisonData = [
  {
    feature: "Concurrent sessions",
    free: "1",
    trader: "5",
    expert: "Unlimited"
  },
  {
    feature: "Historical data",
    free: true,
    trader: true,
    expert: true
  },
  {
    feature: "Basic instruments",
    free: "3 instruments",
    trader: "All instruments",
    expert: "All instruments"
  },
  {
    feature: "Order types",
    free: "Market orders",
    trader: "Market orders",
    expert: "Market orders"
  },
  {
    feature: "Session reports",
    free: true,
    trader: true,
    expert: true
  },
  {
    feature: "Advanced analytics",
    free: false,
    trader: true,
    expert: true
  },
  {
    feature: "Priority support",
    free: false,
    trader: false,
    expert: true
  }
];

/**
 * Get pricing tier by code
 */
export function getPricingTierByCode(code) {
  return pricingTiers.find(tier => tier.code === code);
}
