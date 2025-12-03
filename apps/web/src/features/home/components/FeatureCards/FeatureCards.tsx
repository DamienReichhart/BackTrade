import { FeatureCard } from "./FeatureCard";
import styles from "./FeatureCards.module.css";

/**
 * Feature interface
 */
interface Feature {
    id: string;
    label: string;
    title: string;
    description: string;
}

/**
 * Features data
 */
const features: Feature[] = [
    {
        id: "deterministic",
        label: "Determinism",
        title: "100%",
        description:
            "Same inputs produce the same PnL every time. No random ticks. No hidden fills.",
    },
    {
        id: "concurrency",
        label: "Concurrency",
        title: "30 sessions",
        description: "Run up to 30 sessions in parallel within your plan.",
    },
    {
        id: "latency",
        label: "Latency budget",
        title: "Instant",
        description: "Immediate market entries.",
    },
];

/**
 * FeatureCards component
 *
 * Displays grid of feature highlight cards
 */
export function FeatureCards() {
    return (
        <section className={styles.featureCards}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {features.map((feature) => (
                        <FeatureCard
                            key={feature.id}
                            label={feature.label}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
