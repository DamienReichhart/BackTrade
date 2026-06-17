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
 * Displays pricing plans with features, comparison table, and call-to-action.
 * Uses static configuration only - the FREE plan is displayed here as a static tier.
 */
export default function Pricing() {
    const { tiers, comparisonData, isLoggedIn } = usePricing();
    const { handleSelectPlan } = usePlanSelection(isLoggedIn);

    return (
        <div className={styles.pricing}>
            <Header />

            <main id="main-content" tabIndex={-1} className={styles.main}>
                <PricingHero />
                <PricingCards tiers={tiers} onSelectPlan={handleSelectPlan} />
                <ComparisonTable data={comparisonData} />
                <PricingCTA />
            </main>

            <Footer />
        </div>
    );
}
