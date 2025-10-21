/**
 * Merge API plan data with local pricing configuration
 */
export function mergePlanData(localTiers, apiPlans) {
  if (!apiPlans || apiPlans.length === 0) {
    return localTiers;
  }

  return localTiers.map(tier => {
    // Find matching API plan by code
    const apiPlan = apiPlans.find(
      plan => plan.code.toUpperCase() === tier.code.toUpperCase()
    );

    if (apiPlan) {
      return {
        ...tier,
        id: apiPlan.id,
        stripeProductId: apiPlan.stripeProductId,
        stripePriceId: apiPlan.stripePriceId,
        currency:
          apiPlan.currency === "EUR"
            ? "€"
            : apiPlan.currency === "USD"
              ? "$"
              : tier.currency
      };
    }

    return tier;
  });
}
