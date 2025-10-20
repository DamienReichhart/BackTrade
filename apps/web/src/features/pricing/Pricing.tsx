import { useEffect } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { PricingHero } from "./components/PricingHero";
import { PricingCards } from "./components/PricingCards";
import { ComparisonTable } from "./components/ComparisonTable";
import { PricingCTA } from "./components/PricingCTA";
import { pricingTiers, comparisonData } from "./config/pricingConfig";
import { usePlans } from "../../api/requests/plans";
import styles from "./Pricing.module.css";

/**
 * Pricing page component
 * 
 * Displays pricing plans with features, comparison table, and call-to-action
 * Fetches plan data from API and merges with local configuration
 */
export default function Pricing() {
  // Fetch plans from API
  const { result: apiPlans, loading, error } = usePlans();

  // Log API data for debugging (optional)
  useEffect(() => {
    if (apiPlans) {
      console.log("Plans from API:", apiPlans);
    }
    if (error) {
      console.error("Error fetching plans:", error);
    }
  }, [apiPlans, error]);

  /**
   * Handle plan selection
   */
  const handleSelectPlan = (code: string) => {
    console.log("Selected plan:", code);
    // TODO: Implement plan selection logic (redirect to signup, etc.)
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
        <PricingCards 
          tiers={pricingTiers} 
          onSelectPlan={handleSelectPlan}
        />
        <ComparisonTable data={comparisonData} />
        <PricingCTA />
      </main>
      
      <Footer />
    </div>
  );
}

