import styles from "./LoadingState.module.css";

/**
 * Loading state component
 *
 * Displays a loading indicator while data is being fetched
 */
export function LoadingState() {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>Loading sessions...</p>
    </div>
  );
}

