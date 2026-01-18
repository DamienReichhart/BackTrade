import type { Session } from "@backtrade/types";
import styles from "./SessionInfoSection.module.css";

/**
 * SessionInfoSection props interface
 */
interface SessionInfoSectionProps {
    /**
     * Session data
     */
    session: Session | null | undefined;

    /**
     * Start date of the analytics period
     */
    startDate?: string;

    /**
     * End date of the analytics period
     */
    endDate?: string;
}

/**
 * Format date for display
 */
function formatDate(dateString: string | undefined): string {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

/**
 * Build model description from session settings
 */
function getModelDescription(session: Session | null | undefined): string {
    if (!session) return "—";

    const parts: string[] = ["OHLCV"];

    // Add fill mode
    parts.push("immediate fills");

    // Add cost model
    parts.push("fixed costs");

    return parts.join(" • ");
}

/**
 * SessionInfoSection component
 *
 * Displays session metadata: instrument, period, and model configuration
 */
export function SessionInfoSection({
    session,
    startDate,
    endDate,
}: SessionInfoSectionProps) {
    const instrument = session?.instrument_id ?? "—";
    const periodStart = startDate ?? session?.created_at;
    const periodEnd = endDate ?? new Date().toISOString();

    return (
        <section className={styles.section}>
            <div className={styles.sectionLabel}>Session</div>
            <div className={styles.cards}>
                <div className={styles.card}>
                    <span className={styles.cardLabel}>Instrument</span>
                    <span className={styles.cardValue}>{instrument}</span>
                </div>
                <div className={styles.card}>
                    <span className={styles.cardLabel}>Period</span>
                    <span className={styles.cardValue}>
                        {formatDate(periodStart)} → {formatDate(periodEnd)}
                    </span>
                </div>
                <div className={styles.card}>
                    <span className={styles.cardLabel}>Model</span>
                    <span className={styles.cardValue}>
                        {getModelDescription(session)}
                    </span>
                </div>
            </div>
        </section>
    );
}
