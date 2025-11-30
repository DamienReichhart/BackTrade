import { SessionAddForm } from "./components/SessionAddForm";
import styles from "./SessionAdd.module.css";

/**
 * Session Add page component
 *
 * Full page for creating a new trading session with all required parameters
 */
export function SessionAdd() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create New Session</h1>
          <p className={styles.subtitle}>
            Configure your trading session parameters to get started
          </p>
        </div>
        <SessionAddForm />
      </div>
    </div>
  );
}
