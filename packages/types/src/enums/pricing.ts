import { z } from "zod";

/**
 * Pricing tier codes
 */
export const PricingTierCodeSchema = z.enum(["FREE", "TRADER", "EXPERT"]);
export type PricingTierCode = z.infer<typeof PricingTierCodeSchema>;

/**
 * Get all PricingTierCode enum values as an array
 */
export const PRICING_TIER_CODE_VALUES: PricingTierCode[] = [
    "FREE",
    "TRADER",
    "EXPERT",
];

/**
 * Map PricingTierCode to display label
 */
const PRICING_TIER_CODE_DISPLAY_MAP: Record<PricingTierCode, string> = {
    FREE: "Free",
    TRADER: "Trader",
    EXPERT: "Expert",
};

/**
 * Get display label for a PricingTierCode enum value
 */
export function getPricingTierCodeDisplayLabel(code: PricingTierCode): string {
    return PRICING_TIER_CODE_DISPLAY_MAP[code] ?? code;
}
