import styles from "./ProductCard.module.css";

/**
 * ProductCard props
 */
interface ProductCardProps {
    title: string;
    description: string;
    features: string[];
}

/**
 * ProductCard component
 *
 * Individual product feature card
 */
export function ProductCard({
    title,
    description,
    features,
}: ProductCardProps) {
    return (
        <article className={styles.card}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>

            <ul className={styles.features}>
                {features.map((feature, index) => (
                    <li key={index} className={styles.feature}>
                        <span className={styles.bullet}>●</span>
                        {feature}
                    </li>
                ))}
            </ul>
        </article>
    );
}
