import type { AnalyticsSummary, EquityCurvePoint } from "@backtrade/types";
import { useEquityCurve } from "../../hooks";
import { formatPnL, formatPercentage, formatRatio } from "../../utils";
import styles from "./EquityCurveSection.module.css";

/**
 * EquityCurveSection props interface
 */
interface EquityCurveSectionProps {
    /**
     * Equity curve data points
     */
    equityCurve: EquityCurvePoint[];

    /**
     * Analytics summary for chart stats
     */
    summary: AnalyticsSummary;

    /**
     * Currency code for formatting
     * @default "EUR"
     */
    currency?: string;
}

/**
 * EquityCurveSection component
 *
 * Displays equity curve chart with view tabs and key statistics
 */
export function EquityCurveSection({
    equityCurve,
    summary,
    currency = "EUR",
}: EquityCurveSectionProps) {
    const { chartRef } = useEquityCurve(equityCurve);

    const hasData = equityCurve.length > 0;
    const startEquity = equityCurve[0]?.equity ?? summary.start_balance;
    const totalTrades = summary.total_trades;

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <span className={styles.sectionLabel}>Equity curve</span>
                <div className={styles.chartInfo}>
                    <span className={styles.infoItem}>
                        Start {formatPnL(startEquity, currency, false)}
                    </span>
                    <span className={styles.separator}>•</span>
                    <span className={styles.infoItem}>
                        Max DD {formatPercentage(summary.max_drawdown, 1)}
                    </span>
                    <span className={styles.separator}>•</span>
                    <span className={styles.infoItem}>
                        Trades {totalTrades.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className={styles.chartContainer}>
                {hasData ? (
                    <div ref={chartRef} className={styles.chart} />
                ) : (
                    <div className={styles.empty}>
                        <p className={styles.emptyTitle}>No equity data yet</p>
                        <span className={styles.emptyHint}>
                            The equity curve appears once the session has closed
                            positions.
                        </span>
                    </div>
                )}
            </div>

            <div className={styles.statsRow}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Sharpe</span>
                    <span className={styles.statValue}>
                        {formatRatio(summary.sharpe_ratio)}
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Sortino</span>
                    <span className={styles.statValue}>
                        {formatRatio(summary.sortino_ratio)}
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Max DD</span>
                    <span className={styles.statValue}>
                        {formatPercentage(summary.max_drawdown, 1)}
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Streak</span>
                    <span className={styles.statValue}>
                        <span className={styles.winStreak}>
                            +{summary.win_streak}
                        </span>
                        {" / "}
                        <span className={styles.loseStreak}>
                            -{summary.lose_streak}
                        </span>
                    </span>
                </div>
            </div>
        </section>
    );
}
