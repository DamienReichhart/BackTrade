import { Button } from "../Button";
import styles from "./PricingCard.module.css";

/**
 * Plan feature interface
 */
interface PlanFeature {
  text: string;
  included: boolean;
}

/**
 * PricingCard props
 */
interface PricingCardProps {
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  badge?: string;
  features: PlanFeature[];
  ctaText: string;
  ctaVariant?: "outline" | "primary" | "secondary";
  highlighted?: boolean;
  planId?: number;
  onSelect?: () => void;
}

/**
 * PricingCard component
 *
 * Displays a pricing plan card with features and call-to-action
 *
 */
export function PricingCard({
  name,
  price,
  currency,
  period,
  description,
  badge,
  features,
  ctaText,
  ctaVariant = "primary",
  highlighted = false,
  planId: _planId,
  onSelect,
}: PricingCardProps) {
  return (
    <article
      className={`${styles.card} ${highlighted ? styles.highlighted : ""}`}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.nameSection}>
          <h3 className={styles.name}>{name}</h3>
          <span className={styles.description}>{description}</span>
        </div>
        {badge && (
          <div className={styles.badge}>
            <span>{badge}</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className={styles.priceSection}>
        <div className={styles.price}>
          <span className={styles.currency}>{currency}</span>
          <span className={styles.amount}>{price}</span>
          <span className={styles.period}>{period}</span>
        </div>
      </div>

      {/* Features */}
      <ul className={styles.features}>
        {features.map((feature, index) => (
          <li key={index} className={styles.feature}>
            <span className={styles.checkmark}>✓</span>
            <span className={styles.featureText}>{feature.text}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className={styles.ctaSection}>
        <Button variant={ctaVariant} size="large" fullWidth onClick={onSelect}>
          {ctaText}
        </Button>
      </div>
    </article>
  );
}
