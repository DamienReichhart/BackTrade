import logoSvg from "../../../../assets/logo.svg";
import styles from "./LoginInfoPanel.module.css";

/**
 * Login information panel component
 *
 * Displays branding, headline, description, and feature tags on the left side
 */
export function LoginInfoPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <img src={logoSvg} alt="BackTrade" className={styles.logo} />
          <span className={styles.brandName}>BackTrade</span>
        </div>

        {/* Label */}
        <div className={styles.label}>Trading backtesting platform</div>

        {/* Headline */}
        <h1 className={styles.headline}>
          Deterministic historical trading. Multi-session. Fast.
        </h1>

        {/* Description */}
        <p className={styles.description}>
          Launch sessions at any timestamp. Trade like it's live. Control speed
          and track PnL with strict fixed spread, slippage, and commission
          models.
        </p>

        {/* Feature Tags */}
        <div className={styles.featureTags}>
          <div className={styles.tagRow}>
            <div className={styles.tag}>XAUUSD • EURUSD • BTCUSD</div>
            <div className={styles.tag}>1m • 5m • 15m • 1h • 4h • 1d</div>
          </div>
          <div className={styles.tagRow}>
            <div className={styles.tag}>Immediate fills only</div>
            <div className={styles.tag}>Tabular numerals for KPIs</div>
          </div>
        </div>
      </div>
    </div>
  );
}

