import { PricingCard } from "../../../../components/PricingCard";
import styles from "./PricingCards.module.css";
import { type PricingTier } from "../../types";

/**
 * PricingCards props
 */
export interface PricingCardsProps {
    tiers: PricingTier[];
    onSelectPlan?: (code: string, planId?: number) => void;
}

/**
 * PricingCards component
 *
 * Displays grid of pricing plan cards
 */
export function PricingCards({ tiers, onSelectPlan }: PricingCardsProps) {
    return (
        <section className={styles.pricingCards}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {tiers.map((tier) => (
                        <PricingCard
                            key={tier.code}
                            name={tier.name}
                            price={tier.price}
                            currency={tier.currency}
                            period={tier.period}
                            description={tier.description}
                            badge={tier.badge}
                            features={tier.features}
                            ctaText={tier.ctaText}
                            ctaVariant={tier.ctaVariant}
                            highlighted={tier.highlighted}
                            planId={tier.id}
                            onSelect={() => onSelectPlan?.(tier.code, tier.id)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
