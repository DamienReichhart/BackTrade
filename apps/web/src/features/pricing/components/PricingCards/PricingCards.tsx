import { PricingCard } from "../../../../components/PricingCard";
import { PricingTier } from "../../config/pricingConfig";
import styles from "./PricingCards.module.css";

/**
 * PricingCards props
 */
interface PricingCardsProps {
  tiers: PricingTier[];
  onSelectPlan?: (code: string) => void;
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
              onSelect={() => onSelectPlan?.(tier.code)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

