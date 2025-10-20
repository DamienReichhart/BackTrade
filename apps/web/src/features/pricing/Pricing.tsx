import { useEffect, useMemo } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { PricingHero } from "./components/PricingHero";
import { PricingCards } from "./components/PricingCards";
import { ComparisonTable } from "./components/ComparisonTable";
import { PricingCTA } from "./components/PricingCTA";
import {
  pricingTiers,
  comparisonData,
  PricingTier,
} from "./config/pricingConfig";
import { usePlans } from "../../api/requests/plans";
import { Plan } from "@backtrade/types";
import styles from "./Pricing.module.css";

/**
 * Merge API plan data with local pricing configuration
 */
function mergePlanData(
  localTiers: PricingTier[],
  apiPlans: Plan[] | null,
): PricingTier[] {
  if (!apiPlans || apiPlans.length === 0) {
    return localTiers;
  }

  return localTiers.map((tier) => {
    // Find matching API plan by code
    const apiPlan = apiPlans.find(
      (plan) => plan.code.toUpperCase() === tier.code.toUpperCase(),
    );

    if (apiPlan) {
      return {
        ...tier,
        id: apiPlan.id,
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

/**
 * Pricing page component
 *
 * Displays pricing plans with features, comparison table, and call-to-action
 * Fetches plan data from API and merges with local configuration
 */
export default function Pricing() {
  // Fetch plans from API
  const { result: apiPlans, loading, error, request } = usePlans();

  // Trigger API request on mount
  useEffect(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Merge API data with local configuration
  const mergedTiers = useMemo(() => {
    return mergePlanData(pricingTiers, apiPlans);
  }, [apiPlans]);

  // Log API data for debugging
  useEffect(() => {
    if (apiPlans) {
      console.log("Plans from API:", apiPlans);
      console.log("Merged pricing tiers:", mergedTiers);
    }
    if (error) {
      console.error("Error fetching plans:", error);
    }
  }, [apiPlans, mergedTiers, error]);

  /**
   * Handle plan selection
   */
  const handleSelectPlan = (code: string, planId?: number) => {
    console.log("Selected plan:", { code, planId });
    // TODO: Implement plan selection logic (redirect to signup with plan ID, etc.)
    // Example: navigate(`/signup?plan=${planId}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className={styles.pricing}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loading}>
            <p>Loading pricing information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state (but still display pricing from config)
  if (error) {
    console.warn("Using local pricing configuration due to API error");
  }

  return (
    <div className={styles.pricing}>
      <Header />

      <main className={styles.main}>
        <PricingHero />
        <PricingCards tiers={mergedTiers} onSelectPlan={handleSelectPlan} />
        <ComparisonTable data={comparisonData} />
        <PricingCTA />
      </main>

      <Footer />
    </div>
  );
}
