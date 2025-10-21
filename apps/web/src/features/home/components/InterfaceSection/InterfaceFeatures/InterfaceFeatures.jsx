import { InterfaceFeatureCard } from "./InterfaceFeatureCard";
import styles from "./InterfaceFeatures.module.css";

/**
 * Interface features data
 */
const features = [
  {
    id: "1",
    title: "Order ticket",
    description:
      "Open positions with a single click. Market orders only. No pending orders.",
    badge: "Simple"
  },
  {
    id: "2",
    title: "Charts",
    description:
      "View OHLCV candles for any instrument and timeframe. Navigate with precision."
  },
  {
    id: "3",
    title: "Session reports",
    description:
      "Comprehensive session analytics including PnL, trades, drawdown, win rate per side, timeframe contribution, and costs breakdown."
  }
];

/**
 * InterfaceFeatures component
 *
 * Displays key interface features
 */
export function InterfaceFeatures() {
  return (
    <div className={styles.features}>
      {features.map(feature => (
        <InterfaceFeatureCard
          key={feature.id}
          title={feature.title}
          description={feature.description}
          badge={feature.badge}
        />
      ))}
    </div>
  );
}
