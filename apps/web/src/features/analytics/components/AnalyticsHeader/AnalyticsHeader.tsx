import { type Session, SESSION_STATUS } from "@backtrade/types";
import styles from "./AnalyticsHeader.module.css";

/**
 * AnalyticsHeader props interface
 */
interface AnalyticsHeaderProps {
    /**
     * Session data
     */
    session: Session | null | undefined;

    /**
     * Back button click handler
     */
    onBackClick: () => void;

    /**
     * Export PDF click handler
     */
    onExportPdf: () => void;

    /**
     * Export CSV click handler
     */
    onExportCsv: () => void;
}

/**
 * AnalyticsHeader component
 *
 * Displays the page header with title, status badges, and action buttons
 */
export function AnalyticsHeader({
    session,
    onBackClick,
    onExportPdf,
    onExportCsv,
}: AnalyticsHeaderProps) {
    const sessionName = session?.name ?? "Session Report";
    const status = session?.session_status ?? SESSION_STATUS.ARCHIVED;

    return (
        <header className={styles.header}>
            <div className={styles.titleSection}>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>
                        <span className={styles.logo}>BackTrade</span>
                        <span className={styles.separator}>—</span>
                        <span className={styles.sessionName}>
                            {sessionName}
                        </span>
                    </h1>
                </div>
                <div className={styles.badges}>
                    <span className={`${styles.badge} ${styles.statusBadge}`}>
                        {status === SESSION_STATUS.ARCHIVED
                            ? "Completed"
                            : status}
                    </span>
                    <span className={styles.badge}>Deterministic</span>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.actionButton}
                    onClick={onExportPdf}
                    aria-label="Export PDF"
                >
                    Export PDF
                </button>
                <button
                    type="button"
                    className={styles.actionButton}
                    onClick={onExportCsv}
                    aria-label="Download CSV"
                >
                    Download CSV
                </button>
                <button
                    type="button"
                    className={`${styles.actionButton} ${styles.backButton}`}
                    onClick={onBackClick}
                    aria-label="Back to Sessions"
                >
                    Back to Sessions
                </button>
            </div>
        </header>
    );
}
