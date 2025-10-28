import logoSvg from "../../../../../assets/logo.svg";
import styles from "./InfoPanel.module.css";

interface InfoPanelProps {
  /** The subtitle label displayed below the logo */
  label: string;
  /** The main headline */
  headline: string;
  /** The description text */
  description: string;
  /** Optional benefits section (used in registration) */
  benefits?: {
    title: string;
    items: string[];
  };
}

/**
 * Information panel component
 *
 * Displays branding, headline, description, feature tags, and optional benefits
 */
export function InfoPanel({
  label,
  headline,
  description,
  benefits,
}: InfoPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <img src={logoSvg} alt="BackTrade" className={styles.logo} />
          <span className={styles.brandName}>BackTrade</span>
        </div>

        {/* Label */}
        <div className={styles.label}>{label}</div>

        {/* Headline */}
        <h1 className={styles.headline}>{headline}</h1>

        {/* Description */}
        <p className={styles.description}>{description}</p>

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

        {/* Benefits (Optional) */}
        {benefits && (
          <div className={styles.benefits}>
            <h2 className={styles.benefitsTitle}>{benefits.title}</h2>
            <ul className={styles.benefitsList}>
              {benefits.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
