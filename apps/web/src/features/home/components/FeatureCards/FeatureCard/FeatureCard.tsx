import styles from "./FeatureCard.module.css";

/**
 * FeatureCard props
 */
interface FeatureCardProps {
    label: string;
    title: string;
    description: string;
}

/**
 * FeatureCard component
 *
 * Individual feature card with label, title, and description
 */
export function FeatureCard({ label, title, description }: FeatureCardProps) {
    return (
        <article className={styles.card}>
            <div className={styles.label}>{label}</div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
        </article>
    );
}
