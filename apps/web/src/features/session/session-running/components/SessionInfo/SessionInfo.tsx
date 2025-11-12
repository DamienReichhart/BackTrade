import styles from "./SessionInfo.module.css";
import { useCurrentSessionStore } from "../../../../../context/CurrentSessionContext";
import { useSessionMetrics } from "../../hooks";
import { formatCurrency, formatPercentage } from "./utils";

/**
 * Session info component displaying session KPIs (balance, equity, drawdown, win rate, leverage).
 * Uses currentSession from the global store, which is set by SessionRunning.
 */
export function SessionInfo() {
  const { currentSession } = useCurrentSessionStore();
  const { metrics, isLoading } = useSessionMetrics();

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.sectionHeader}>Session info</div>
        <div className={styles.infoGrid}>
          <div>
            <div className={styles.infoLabel}>Start balance</div>
            <div className={styles.infoValue}>Loading…</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Current equity</div>
            <div className={styles.infoValue}>Loading…</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Drawdown</div>
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
            {formatCurrency(currentSession?.initial_balance ?? 0)}
          </div>
        </div>
        <div>
          <div className={styles.infoLabel}>Current equity</div>
          <div className={styles.infoValue}>
            {formatCurrency(metrics.equity)}
          </div>
        </div>
        <div>
          <div className={styles.infoLabel}>Drawdown</div>
          <div className={styles.infoValue}>
            -{formatPercentage(metrics.drawdownPct)}
          </div>
        </div>
        <div>
          <div className={styles.infoLabel}>Win rate</div>
          <div className={styles.infoValue}>
            {formatPercentage(metrics.winRate)}
          </div>
        </div>
        <div>
          <div className={styles.infoLabel}>Leverage</div>
          <div className={styles.infoValue}>
            × {currentSession?.leverage ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}
