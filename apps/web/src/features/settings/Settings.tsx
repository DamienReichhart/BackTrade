import { Button } from "../../components";
import { useAuthStore } from "../../context/AuthContext";
import styles from "./Settings.module.css";
import {
  AccountSection,
  SecuritySection,
  DataPrivacySection,
} from "./components";

/**
 * Settings page component
 *
 * Main container for user settings including account, security, and data privacy configurations
 */
export function Settings() {
  const { user } = useAuthStore();
  const accountId = user?.id.toString() ?? "";

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <Button variant="outline" size="medium">
          Back to app
        </Button>
      </header>

      {/* Settings Sections */}
      <div className={styles.content}>
        <AccountSection accountId={accountId} />
        <SecuritySection />
        <DataPrivacySection />
      </div>
    </div>
  );
}
