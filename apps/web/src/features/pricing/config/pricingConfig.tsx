/**
 * Pricing configuration
 *
 * Defines pricing tiers, features, and comparison data
 * Merged with API data to display complete pricing information
 */

import { type PricingTier, type ComparisonRow } from "../types";

/**
 * Pricing tiers configuration
 */
export const pricingTiers: PricingTier[] = [
  {
    code: "FREE",
    name: "Free",
    price: 0,
    currency: "€",
    period: "/month",
    description: "Start",
    features: [
      { text: "1 active sessions", included: true },
      { text: "Deterministic OHLCV engine", included: true },
      { text: "Market entries only • immediate fills", included: true },
      { text: "Fixed spread, slippage, commission", included: true },
      { text: "Session analytics + JSON export", included: true },
    ],
    ctaText: "Create account",
    ctaVariant: "outline",
  },
  {
    code: "TRADER",
    name: "Trader",
    price: 19,
    currency: "€",
    period: "/month",
    description: "Scale",
    badge: "Most popular",
    badgeVariant: "popular",
    features: [
      { text: "10 active sessions", included: true },
      { text: "All Free features", included: true },
      { text: "Multi-session run", included: true },
      { text: "Export equity curve and trades table", included: true },
    ],
    ctaText: "Choose Trader",
    ctaVariant: "primary",
    highlighted: true,
  },
  {
    code: "EXPERT",
    name: "Expert",
    price: 49,
    currency: "€",
    period: "/month",
    description: "Max",
    features: [
      { text: "30 active sessions", included: true },
      { text: "All Trader features", included: true },
      { text: "Highest parallelism within quota", included: true },
    ],
    ctaText: "Choose Expert",
    ctaVariant: "primary",
  },
];

/**
 * Comparison table data
 */
export const comparisonData: ComparisonRow[] = [
  {
    feature: "Active sessions quota",
    free: "1 session",
    trader: "10 sessions",
    expert: "30 sessions",
  },
  {
    feature: "Session lifecycle",
    free: "Running → Paused → Archived",
    trader: "Running → Paused → Archived",
    expert: "Running → Paused → Archived",
  },
  {
    feature: "Entries and fills",
    free: "Immediate market",
    trader: "Immediate market",
    expert: "Immediate market",
  },
  {
    feature: "Costs model",
    free: "Fixed spread • slippage • commission",
    trader: "Fixed spread • slippage • commission",
    expert: "Fixed spread • slippage • commission",
  },
  {
    feature: "Pending/limit/stop orders",
    free: "Not included",
    trader: "Not included",
    expert: "Not included",
  },
  {
    feature: "Tick simulation",
    free: "Not included",
    trader: "Not included",
    expert: "Not included",
  },
];

/**
 * Get pricing tier by code
 */
export function getPricingTierByCode(code: string): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.code === code);
}
