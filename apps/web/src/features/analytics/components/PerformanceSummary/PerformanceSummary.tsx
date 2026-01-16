import type { AnalyticsSummary } from "@backtrade/types";
import { StatCard } from "../StatCard";
import { formatPnL, formatPercentage, formatRatio } from "../../utils";
import styles from "./PerformanceSummary.module.css";

/**
 * PerformanceSummary props interface
 */
interface PerformanceSummaryProps {
    /**
     * Analytics summary data
     */
    summary: AnalyticsSummary;

    /**
     * Currency code for formatting
     * @default "EUR"
     */
    currency?: string;
}

/**
 * PerformanceSummary component
 *
 * Displays key performance metrics in a grid layout
 */
export function PerformanceSummary({
    summary,
    currency = "EUR",
}: PerformanceSummaryProps) {
    const returnColor =
        summary.return_percentage >= 0 ? "positive" : "negative";
    const pnlColor = summary.net_pnl >= 0 ? "positive" : "negative";

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <span className={styles.sectionLabel}>Performance summary</span>
                <span className={styles.currencyBadge}>PnL in {currency}</span>
            </div>

            {/* Primary Metrics */}
            <div className={styles.primaryGrid}>
                <StatCard
                    label="Trades"
                    value={summary.total_trades.toLocaleString()}
                />
                <StatCard
                    label="Expectancy"
                    value={formatPnL(summary.expectancy, currency, false)}
                    subtext="/ trade"
                />
                <StatCard
                    label="Commission paid"
                    value={formatPnL(summary.commission_paid, currency, false)}
                />
                <StatCard
                    label="Return"
                    value={formatPercentage(summary.return_percentage, 2, true)}
                    valueColor={returnColor}
                />
                <StatCard
                    label="Win rate"
                    value={formatPercentage(summary.win_rate, 1)}
                />
                <StatCard
                    label="Profit factor"
                    value={formatRatio(summary.profit_factor)}
                />
            </div>

            {/* Balance Metrics */}
            <div className={styles.balanceGrid}>
                <StatCard
                    label="Start balance"
                    value={formatPnL(summary.start_balance, currency, false)}
                    variant="large"
                />
                <StatCard
                    label="Ending equity"
                    value={formatPnL(summary.ending_equity, currency, false)}
                    variant="large"
                />
                <StatCard
                    label="Net PnL"
                    value={formatPnL(summary.net_pnl, currency, true)}
                    valueColor={pnlColor}
                    variant="large"
                />
            </div>
        </section>
    );
}
