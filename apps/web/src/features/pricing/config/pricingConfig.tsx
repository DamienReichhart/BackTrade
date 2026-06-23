/**
 * Pricing configuration
 *
 * Defines pricing tiers, features, and comparison data.
 * This is static configuration
 * and does not exist in the database.
 */

import { type PricingTier, type ComparisonRow } from "../types";
import type {
    PricingTierCode,
    ButtonVariant,
    BadgeVariant,
} from "@backtrade/types";
import { PLAN_PRESENTATION } from "../../../config/plans";

/**
 * Pricing tiers configuration
 */
export const pricingTiers: PricingTier[] = [
    {
        code: "FREE" as PricingTierCode,
        name: "Free",
        price: 0,
        currency: "€",
        period: "/month",
        description: "Start",
        features: PLAN_PRESENTATION.FREE.features.map((text) => ({
            text,
            included: true,
        })),
        ctaText: "Create account",
        ctaVariant: "outline" as ButtonVariant,
    },
    {
        code: "TRADER" as PricingTierCode,
        name: "Trader",
        price: 19,
        currency: "€",
        period: "/month",
        description: "Scale",
        badge: "Most popular",
        badgeVariant: "popular" as BadgeVariant,
        features: PLAN_PRESENTATION.TRADER.features.map((text) => ({
            text,
            included: true,
        })),
        ctaText: "Choose Trader",
        ctaVariant: "primary" as ButtonVariant,
        highlighted: true,
    },
    {
        code: "EXPERT" as PricingTierCode,
        name: "Expert",
        price: 49,
        currency: "€",
        period: "/month",
        description: "Max",
        features: PLAN_PRESENTATION.EXPERT.features.map((text) => ({
            text,
            included: true,
        })),
        ctaText: "Choose Expert",
        ctaVariant: "primary" as ButtonVariant,
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
export function getPricingTierByCode(
    code: PricingTierCode
): PricingTier | undefined {
    return pricingTiers.find((tier) => tier.code === code);
}
