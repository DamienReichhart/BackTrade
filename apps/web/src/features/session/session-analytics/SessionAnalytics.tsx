import { useParams } from "react-router-dom";
import { useSession } from "../../../api/hooks/requests/sessions";
import styles from "./SessionAnalytics.module.css";

/**
 * Session Analytics page
 *
 * Displays comprehensive analytics for archived sessions including
 * performance metrics, equity curve, drawdowns, and trade statistics
 */
export function SessionAnalytics() {
  const { id = "" } = useParams();
  const { data: session, isLoading } = useSession(id);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.loading}>Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.error}>Session not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Session Analytics</h1>
          <p className={styles.subtitle}>
            Comprehensive performance analysis for {session.name ?? "Session"}
          </p>
        </header>

        <div className={styles.analyticsGrid}>
          {/* Performance Metrics Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Performance Metrics</h2>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Initial Balance</div>
                <div className={styles.metricValue}>
                  {session.initial_balance?.toLocaleString() || "N/A"}
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Final Balance</div>
                <div className={styles.metricValue}>Calculating...</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Total P&L</div>
                <div className={styles.metricValue}>Calculating...</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Win Rate</div>
                <div className={styles.metricValue}>Calculating...</div>
              </div>
            </div>
          </section>

          {/* Equity Curve Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Equity Curve</h2>
            <div className={styles.chartPlaceholder}>
              <p className={styles.placeholderText}>
                Equity curve visualization will be displayed here
              </p>
            </div>
          </section>

          {/* Drawdown Analysis Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Drawdown Analysis</h2>
            <div className={styles.chartPlaceholder}>
              <p className={styles.placeholderText}>
                Drawdown chart will be displayed here
              </p>
            </div>
          </section>

          {/* Trade Statistics Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Trade Statistics</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Trades</div>
                <div className={styles.statValue}>Calculating...</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Winning Trades</div>
                <div className={styles.statValue}>Calculating...</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Losing Trades</div>
                <div className={styles.statValue}>Calculating...</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Average Win</div>
                <div className={styles.statValue}>Calculating...</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Average Loss</div>
                <div className={styles.statValue}>Calculating...</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Profit Factor</div>
                <div className={styles.statValue}>Calculating...</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
