import { Button } from "../../../../components";
import { useDataPrivacySection } from "../../hooks";
import styles from "./DataPrivacySection.module.css";

/**
 * Data & Privacy section component
 *
 * Handles data retention and account deletion
 */
export function DataPrivacySection() {
  const {
    showConfirmDialog,
    error,
    isLoading,
    handleDeleteAccount,
    handleConfirmDelete,
    handleCancelDelete,
  } = useDataPrivacySection();

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Data & Privacy</h2>
        <a href="#" className={styles.link}>
          Exports and retention
        </a>
      </div>

      <div className={styles.content}>
        <div className={styles.dangerZone}>
          <h3 className={styles.dangerTitle}>Danger zone</h3>
          <p className={styles.dangerText}>
            Deleting your account removes sessions, analytics, and profile data.
            This action is irreversible.
          </p>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {showConfirmDialog ? (
            <div className={styles.confirmDialog}>
              <p className={styles.confirmText}>
                Are you absolutely sure? This action cannot be undone.
              </p>
              <div className={styles.confirmActions}>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className={styles.deleteButton}
                >
                  {isLoading ? "Deleting..." : "Yes, delete my account"}
                </Button>
                <Button
                  variant="outline"
                  size="medium"
                  onClick={handleCancelDelete}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              size="medium"
              onClick={handleConfirmDelete}
              className={styles.deleteButton}
            >
              Delete account
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
