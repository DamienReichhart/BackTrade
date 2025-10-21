import { FeatureCard } from "./FeatureCard";
import styles from "./FeatureCards.module.css";

/**
 * Features data
 */
const features = [
  {
    id: 1,
    label: "Strategy Builder",
    title: "Build & Test Your Strategies",
    description:
      "Create sophisticated trading strategies with our intuitive builder and test them against historical data."
  },
  {
    id: 2,
    label: "Performance Analytics",
    title: "Detailed Performance Metrics",
    description:
      "Analyze your strategy performance with comprehensive metrics including PnL, drawdown, win rate, and more."
  },
  {
    id: 3,
    label: "Data Management",
    title: "Flexible Data Import",
    description:
      "Import your own historical data or use our curated datasets to backtest your strategies accurately."
  }
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
          {features.map(feature => (
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
