import { type PricingTier } from "../types";
import { type Plan } from "@backtrade/types";

/**
 * Merge API plan data with local pricing configuration
 */
export function mergePlanData(
    localTiers: PricingTier[],
    apiPlans: Plan[] | null
): PricingTier[] {
    if (!apiPlans || apiPlans.length === 0) {
        return localTiers;
    }

    return localTiers.map((tier) => {
        // Find matching API plan by code
        const apiPlan = apiPlans.find(
            (plan) => plan.code.toUpperCase() === tier.code.toUpperCase()
        );

        if (apiPlan) {
            return {
                ...tier,
                id: apiPlan.id,
                price: apiPlan.price,
                stripeProductId: apiPlan.stripe_product_id,
                stripePriceId: apiPlan.stripe_price_id,
                currency:
                    apiPlan.currency === "EUR"
                        ? "€"
                        : apiPlan.currency === "USD"
                          ? "$"
                          : tier.currency,
            };
        }

        return tier;
    });
}
