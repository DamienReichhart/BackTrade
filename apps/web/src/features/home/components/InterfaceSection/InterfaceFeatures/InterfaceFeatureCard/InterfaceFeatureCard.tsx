import styles from "./InterfaceFeatureCard.module.css";

/**
 * InterfaceFeatureCard props
 */
interface InterfaceFeatureCardProps {
  title: string;
  description: string;
  badge?: string;
}

/**
 * InterfaceFeatureCard component
 *
 * Individual interface feature card
 */
export function InterfaceFeatureCard({
  title,
  description,
  badge,
}: InterfaceFeatureCardProps) {
  return (
    <article className={styles.card}>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.description}>{description}</p>
      {badge && (
        <div className={styles.badge}>
          <span className={styles.bullet}>●</span>
          {badge}
        </div>
      )}
    </article>
  );
}
