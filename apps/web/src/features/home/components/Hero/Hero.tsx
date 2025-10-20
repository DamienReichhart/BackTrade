import { Button } from "../../../../components/Button";
import { TickerBar } from "./TickerBar";
import styles from "./Hero.module.css";

/**
 * Hero section component
 * 
 * Main landing section with headline, description, and call-to-action buttons
 */
export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* Label */}
        <div className={styles.label}>
          <span>Trading backtesting platform</span>
        </div>

        {/* Headline */}
        <h1 className={styles.headline}>
          Deterministic historical trading. Multi-session. Fast.
        </h1>

        {/* Description */}
        <p className={styles.description}>
          Launch a session at any timestamp. Trade like it's live with your own clock. Strict fixed
          spread, slippage, and commission. No pending orders. Complete reports for every session.
        </p>

        {/* CTA Buttons */}
        <div className={styles.actions}>
          <Button variant="primary" size="large">
            Start free
          </Button>
          <Button variant="secondary" size="large">
            See the UI
          </Button>
        </div>

        {/* Ticker Bar */}
        <TickerBar />

        {/* Models Label */}
        <div className={styles.modelsLabel}>
          <span>Models: <strong>OHLCV • immediate fills • fixed costs</strong></span>
        </div>
      </div>
    </section>
  );
}

