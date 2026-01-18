import { InterfaceFeatureCard } from "./InterfaceFeatureCard";
import styles from "./InterfaceFeatures.module.css";

/**
 * Interface feature interface
 */
interface InterfaceFeature {
    id: string;
    title: string;
    description: string;
    badge?: string;
}

/**
 * Interface features data
 */
const features: InterfaceFeature[] = [
    {
        id: "order-ticket",
        title: "Order ticket",
        description:
            "SymbolJ • XAUUSD • Qty: 1.00 lots • SL: 2 352.00 • TP: 2 372.50",
        badge: "Immediate fills • Fixed costs",
    },
    {
        id: "open-positions",
        title: "Open positions",
        description:
            "XAUUSD Buy 1.20 @ 2 360.80 ~ PnL +€ 852.00\nEURUSD Sell 0.80 @ 1.07520 ~ PnL -€ 232.40\nBTCUSD Buy 0.15 @ 63 900.00 ~ PnL +€ 460.50",
    },
    {
        id: "session-metrics",
        title: "Session metrics",
        description:
            "Equity curve, drawdown, win rate per side, timeframe contribution, and costs breakdown.",
    },
];

/**
 * InterfaceFeatures component
 *
 * Displays key interface features
 */
export function InterfaceFeatures() {
    return (
        <div className={styles.features}>
            {features.map((feature) => (
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
