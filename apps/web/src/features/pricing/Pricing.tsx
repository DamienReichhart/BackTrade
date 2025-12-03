import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { PricingHero } from "./components/PricingHero";
import { PricingCards } from "./components/PricingCards";
import { ComparisonTable } from "./components/ComparisonTable";
import { PricingCTA } from "./components/PricingCTA";
import { usePricing, usePlanSelection } from "./hooks";
import styles from "./Pricing.module.css";

/**
 * Pricing page component
 *
 * Displays pricing plans with features, comparison table, and call-to-action
 * Fetches plan data from API and merges with local configuration
 */
export default function Pricing() {
    const { mergedTiers, comparisonData, isLoading, isLoggedIn } = usePricing();
    const { handleSelectPlan } = usePlanSelection(isLoggedIn);

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
                <PricingCards
                    tiers={mergedTiers}
                    onSelectPlan={handleSelectPlan}
                />
                <ComparisonTable data={comparisonData} />
                <PricingCTA />
            </main>

            <Footer />
        </div>
    );
}
