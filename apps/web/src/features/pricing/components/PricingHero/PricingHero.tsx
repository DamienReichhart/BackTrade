import styles from "./PricingHero.module.css";

/**
 * PricingHero component
 *
 * Hero section for the pricing page with headline
 */
export function PricingHero() {
    return (
        <section className={styles.pricingHero}>
            <div className={styles.container}>
                <h1 className={styles.headline}>
                    Simple pricing. No surprises.
                </h1>
            </div>
        </section>
    );
}
