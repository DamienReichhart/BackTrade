import styles from "./SessionMetrics.module.css";
import { useSessionInfo } from "../../hooks";
import { formatCurrency, formatPercentage } from "../SessionInfo/utils";

/**
 * SessionMetrics component displaying critical trading metrics (equity, drawdown, margin level).
 * Positioned prominently between TopBar and Chart for maximum visibility during trading.
 * Fetches data from the API endpoint /sessions/:id/info.
 */
export function SessionMetrics() {
    const { sessionInfo, isLoading } = useSessionInfo();

    if (isLoading || !sessionInfo) {
        return (
            <div className={styles.metricsBar}>
                <div className={styles.metric}>
                    <div className={styles.metricLabel}>Current equity</div>
                    <div className={styles.metricValue}>Loading…</div>
                </div>
                <div className={styles.separator} />
                <div className={styles.metric}>
                    <div className={styles.metricLabel}>Drawdown</div>
                    <div className={styles.metricValue}>Loading…</div>
                </div>
                <div className={styles.separator} />
                <div className={styles.metric}>
                    <div className={styles.metricLabel}>Margin level</div>
                    <div className={styles.metricValue}>Loading…</div>
                </div>
            </div>
        );
    }

    const hasDrawdown = sessionInfo.drawdown > 0;
    const isMarginLevelLow =
        sessionInfo.margin_level > 0 && sessionInfo.margin_level < 100;

    return (
        <div className={styles.metricsBar}>
            <div className={styles.metric}>
                <div className={styles.metricLabel}>Current equity</div>
                <div className={styles.metricValue}>
                    {formatCurrency(sessionInfo.current_equity)}
                </div>
            </div>
            <div className={styles.separator} />
            <div className={styles.metric}>
                <div className={styles.metricLabel}>Drawdown</div>
                <div
                    className={`${styles.metricValue} ${
                        hasDrawdown ? styles.metricValueNegative : ""
                    }`}
                >
                    {hasDrawdown ? "-" : ""}
                    {formatPercentage(sessionInfo.drawdown)}
                </div>
            </div>
            <div className={styles.separator} />
            <div className={styles.metric}>
                <div className={styles.metricLabel}>Margin level</div>
                <div
                    className={`${styles.metricValue} ${
                        isMarginLevelLow ? styles.metricValueWarning : ""
                    }`}
                >
                    {formatPercentage(sessionInfo.margin_level)}
                </div>
            </div>
        </div>
    );
}
