import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/Button";
import { ProductCard } from "./ProductCard";
import styles from "./ProductSection.module.css";

/**
 * Product features data
 */
const productFeatures = [
  {
    id: "1",
    title: "Live simulation",
    description:
      "Simulated live trading at any historical timestamp with deterministic fills, slippage, spread, commission, description, equity, and margin.",
    features: [
      "Market orders only",
      "Fixed costs model",
      "Immediate fills",
      "Multi-session support"
    ]
  },
  {
    id: "2",
    title: "Historical data",
    description:
      "Access comprehensive historical market data with multiple timeframes and instruments.",
    features: [
      "OHLCV candles",
      "Multiple timeframes",
      "Major forex pairs",
      "Crypto & commodities"
    ]
  },
  {
    id: "3",
    title: "Analytics",
    description:
      "Detailed session analytics with metrics, PnL tracking, equity curve, drawdowns, and exports. Net PnL and expectancy per trade.",
    features: [
      "Session reports",
      "PnL tracking",
      "Win rate analysis",
      "Export capabilities"
    ]
  }
];

/**
 * ProductSection component
 *
 * Displays product features with call-to-action
 */
export function ProductSection() {
  const navigate = useNavigate();

  return (
    <section id='product' className={styles.productSection}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>Product</h2>
          <Button
            variant='outline'
            size='medium'
            onClick={() => navigate("/pricing")}
          >
            Choose a plan
          </Button>
        </header>

        <div className={styles.grid}>
          {productFeatures.map(feature => (
            <ProductCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              features={feature.features}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
