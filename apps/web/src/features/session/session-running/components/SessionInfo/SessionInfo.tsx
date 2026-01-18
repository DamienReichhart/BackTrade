import styles from "./SessionInfo.module.css";
import { useSessionInfo } from "../../hooks";
import { formatCurrency, formatPercentage } from "./utils";

/**
 * Fetches data from the API endpoint /sessions/:id/info.
 */
export function SessionInfo() {
    const { sessionInfo, isLoading } = useSessionInfo();

    if (isLoading || !sessionInfo) {
        return (
            <div className={styles.card}>
                <div className={styles.sectionHeader}>Session info</div>
                <div className={styles.infoGrid}>
                    <div>
                        <div className={styles.infoLabel}>Start balance</div>
                        <div className={styles.infoValue}>Loading…</div>
                    </div>
                    <div>
                        <div className={styles.infoLabel}>Win rate</div>
                        <div className={styles.infoValue}>Loading…</div>
                    </div>
                    <div>
                        <div className={styles.infoLabel}>Leverage</div>
                        <div className={styles.infoValue}>Loading…</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.sectionHeader}>Session info</div>
            <div className={styles.infoGrid}>
                <div>
                    <div className={styles.infoLabel}>Start balance</div>
                    <div className={styles.infoValue}>
                        {formatCurrency(sessionInfo.start_balance)}
                    </div>
                </div>
                <div>
                    <div className={styles.infoLabel}>Win rate</div>
                    <div className={styles.infoValue}>
                        {formatPercentage(sessionInfo.win_rate)}
                    </div>
                </div>
                <div>
                    <div className={styles.infoLabel}>Leverage</div>
                    <div className={styles.infoValue}>
                        × {sessionInfo.leverage}
                    </div>
                </div>
            </div>
        </div>
    );
}
