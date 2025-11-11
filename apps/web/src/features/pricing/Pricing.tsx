import { useMemo } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { PricingHero } from "./components/PricingHero";
import { PricingCards } from "./components/PricingCards";
import { ComparisonTable } from "./components/ComparisonTable";
import { PricingCTA } from "./components/PricingCTA";
import { pricingTiers, comparisonData } from "./config/pricingConfig";
import { useNavigate } from "react-router-dom";
import { usePlans } from "../../api/requests/plans";
import { mergePlanData } from "./utils";
import { useAuthStore } from "../../context/AuthContext";
import styles from "./Pricing.module.css";

/**
 * Pricing page component
 *
 * Displays pricing plans with features, comparison table, and call-to-action
 * Fetches plan data from API and merges with local configuration
 */
export default function Pricing() {
  // Fetch plans from API (automatically fetches on mount with React Query)
  const { data: apiPlans, isLoading } = usePlans();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isLoggedIn = !!user;

  // Merge API data with local configuration
  const mergedTiers = useMemo(() => {
    return mergePlanData(pricingTiers, apiPlans);
  }, [apiPlans]);

  /**
   * Handle plan selection
   */
  const handleSelectPlan = (_code: string, _planId?: number) => {
    if (isLoggedIn) {
      navigate("/dashboard/plans");
    } else {
      navigate("/signup");
    }
  };

  // Show loading state
  if (isLoading) {
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
