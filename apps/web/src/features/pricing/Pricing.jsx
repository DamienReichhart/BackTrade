import { useEffect, useMemo } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { PricingHero } from "./components/PricingHero";
import { PricingCards } from "./components/PricingCards";
import { ComparisonTable } from "./components/ComparisonTable";
import { PricingCTA } from "./components/PricingCTA";
import { pricingTiers, comparisonData } from "./config/pricingConfig";
import { usePlans } from "../../api/requests/plans";
import { mergePlanData } from "./utils";
import styles from "./Pricing.module.css";

/**
 * Pricing page component
 *
 * Displays pricing plans with features, comparison table, and call-to-action
 * Fetches plan data from API and merges with local configuration
 */
export default function Pricing() {
  // Fetch plans from API
  const { result, loading, request } = usePlans();

  // Trigger API request on mount
  useEffect(() => {
    request();
  }, []);

  // Merge API data with local configuration
  const mergedTiers = useMemo(() => {
    const apiPlans = result || [];
    return mergePlanData(pricingTiers, apiPlans);
  }, [result]);

  /**
   * Handle plan selection
   */
  const handleSelectPlan = (code, planId) => {
    console.log("Selected plan:", { code, planId });
    // TODO: Implement plan selection logic (redirect to checkout, etc.)
    // Example: navigate(`/checkout?plan=${planId}`);
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
