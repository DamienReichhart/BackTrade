import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/Button";
import { ProductCard } from "./ProductCard";
import styles from "./ProductSection.module.css";

/**
 * Product feature interface
 */
interface ProductFeature {
  id: string;
  title: string;
  description: string;
  features: string[];
}

/**
 * Product features data
 */
const productFeatures: ProductFeature[] = [
  {
    id: "session-engine",
    title: "Session engine",
    description:
      "Single-instrument sessions bound to instrument and start time. Own balance, equity, and margin.",
    features: ["OHLCV bars • UTC clock • step or skip"],
  },
  {
    id: "immediate-execution",
    title: "Immediate execution",
    description:
      "Open Long or Short at the simulated mark. Optional TP/SL. Manage Close and Close-At.",
    features: ["Market only • no pending orders"],
  },
  {
    id: "analytics",
    title: "Analytics",
    description:
      "Per-session analytics, equity curve, drawdowns, and exports. Net PnL and expectancy per trade.",
    features: ["JSON export"],
  },
];

/**
 * ProductSection component
 *
 * Displays product features with call-to-action
 */
export function ProductSection() {
  const navigate = useNavigate();

  return (
    <section id="product" className={styles.productSection}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>Product</h2>
          <Button
            variant="outline"
            size="medium"
            onClick={() => navigate("/pricing")}
          >
            Choose a plan
          </Button>
        </header>

        <div className={styles.grid}>
          {productFeatures.map((feature) => (
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
