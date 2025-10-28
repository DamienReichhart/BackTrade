import { Button } from "../../../../components/Button";
import styles from "./DashboardHeader.module.css";

/**
 * Dashboard header component
 *
 * Displays page title and primary actions
 */
export function DashboardHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.content}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your trading sessions and view performance metrics
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" size="medium">
            New Session
          </Button>
        </div>
      </div>
    </div>
  );
}
