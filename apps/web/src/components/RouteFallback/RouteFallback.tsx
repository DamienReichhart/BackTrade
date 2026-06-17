import styles from "./RouteFallback.module.css";

/**
 * Full-area loading fallback shown while a lazily-loaded route chunk loads.
 */
export function RouteFallback() {
    return (
        <div className={styles.fallback} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <span className={styles.label}>Loading…</span>
        </div>
    );
}
