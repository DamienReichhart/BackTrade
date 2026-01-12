import { useAuthStore } from "../../../store/auth";
import { pricingTiers, comparisonData } from "../config/pricingConfig";

/**
 * Hook to manage pricing page data and state
 *
 * Uses static configuration only - no API calls.
 * The FREE plan is displayed only on this page as a static tier.
 *
 * @returns Pricing data and authentication state
 */
export function usePricing() {
    const { user } = useAuthStore();
    const isLoggedIn = !!user;

    return {
        tiers: pricingTiers,
        comparisonData,
        isLoggedIn,
    };
}
