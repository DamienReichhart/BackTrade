import styles from "./StatusIndicator.module.css";

/**
 * Status indicator component
 *
 * Displays system status at the top of the page
 */
export function StatusIndicator() {
  return (
    <div className={styles.statusIndicator}>
      <div className={styles.statusDot}></div>
      <span>All systems operational</span>
    </div>
  );
}
