import logoPng from "../../../../../assets/logo.png";
import styles from "./FormHeader.module.css";

interface FormHeaderProps {
  /** The label text displayed at the top (e.g., "SIGN IN", "CREATE ACCOUNT") */
  label: string;
}

/**
 * Form header component
 *
 * Displays the form label, logo with brand name, and secure badge
 */
export function FormHeader({ label }: FormHeaderProps) {
  return (
    <div className={styles.formHeader}>
      <div className={styles.formLabel}>{label}</div>
      <div className={styles.logoContainer}>
        <img src={logoPng} alt="BackTrade" className={styles.logo} />
        <span className={styles.brandName}>BackTrade</span>
      </div>
      <div className={styles.secureBadge}>SECURE AREA</div>
    </div>
  );
}
