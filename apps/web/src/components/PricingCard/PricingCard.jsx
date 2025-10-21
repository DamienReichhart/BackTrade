import { Button } from "../Button/index.jsx";
import styles from "./PricingCard.module.css";

/**
 * PricingCard component
 *
 * Displays a pricing plan card with features and call-to-action
 *
 * @example
 * ```jsx
 * <PricingCard
 *   name="Pro"
 *   price={19}
 *   currency="€"
 *   period="/month"
 *   description="For professionals"
 *   features={[...]}
 *   ctaText="Get started"
 *   ctaVariant="primary"
 * />
 * ```
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
  _planId,
  onSelect
}) {
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
        <Button variant={ctaVariant} size='large' fullWidth onClick={onSelect}>
          {ctaText}
        </Button>
      </div>
    </article>
  );
}
