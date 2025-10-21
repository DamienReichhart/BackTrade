import styles from "./FeatureCard.module.css";

/**
 * FeatureCard props
 */
/**
 * FeatureCard component
 *
 * Individual feature card with label, title, and description
 */
export function FeatureCard({ label, title, description }) {
  return (
    <article className={styles.card}>
      <div className={styles.label}>{label}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </article>
  );
}
