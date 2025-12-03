import { useMemo } from "react";
import { usePlans } from "../../../api/hooks/requests/plans";
import { useAuthStore } from "../../../store/auth";
import { pricingTiers, comparisonData } from "../config/pricingConfig";
import { mergePlanData } from "../utils/plans";

/**
 * Hook to manage pricing page data and state
 *
 * @returns Pricing data, loading state, and merged tiers
 */
export function usePricing() {
    const { data: apiPlans, isLoading } = usePlans();
    const { user } = useAuthStore();
    const isLoggedIn = !!user;

    // Merge API data with local configuration
    const mergedTiers = useMemo(() => {
        return mergePlanData(pricingTiers, apiPlans);
    }, [apiPlans]);

    return {
        mergedTiers,
        comparisonData,
        isLoading,
        isLoggedIn,
    };
}
