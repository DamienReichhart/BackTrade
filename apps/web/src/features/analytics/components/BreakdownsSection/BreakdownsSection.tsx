import type { AnalyticsBreakdowns, AnalyticsCosts } from "@backtrade/types";
import { formatPnL, formatPercentage } from "../../utils";
import styles from "./BreakdownsSection.module.css";

/**
 * BreakdownsSection props interface
 */
interface BreakdownsSectionProps {
    /**
     * Trade side breakdowns (long/short)
     */
    breakdowns: AnalyticsBreakdowns;

    /**
     * Trading costs breakdown
     */
    costs: AnalyticsCosts;

    /**
     * Currency code for formatting
     * @default "EUR"
     */
    currency?: string;
}

/**
 * BreakdownsSection component
 *
 * Displays trade breakdowns by side, timeframe contribution, and costs
 */
export function BreakdownsSection({
    breakdowns,
    costs,
    currency = "EUR",
}: BreakdownsSectionProps) {
    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <span className={styles.sectionLabel}>Breakdowns</span>
            </div>

            <div className={styles.grid}>
                {/* Side Breakdown */}
                <div className={styles.card}>
                    <div className={styles.tableHeader}>
                        <span className={styles.columnHeader}>Side</span>
                        <span className={styles.columnHeader}>
                            Win • PnL • Avg
                        </span>
                    </div>
                    <div className={styles.tableBody}>
                        <div className={styles.row}>
                            <span className={styles.sideLabel}>Long</span>
                            <span className={styles.sideValues}>
                                <span className={styles.value}>
                                    {formatPercentage(
                                        breakdowns.long.win_percentage,
                                        0
                                    )}
                                </span>
                                <span className={styles.separator}>•</span>
                                <span
                                    className={`${styles.value} ${breakdowns.long.pnl >= 0 ? styles.positive : styles.negative}`}
                                >
                                    {formatPnL(
                                        breakdowns.long.pnl,
                                        currency,
                                        true
                                    )}
                                </span>
                                <span className={styles.separator}>•</span>
                                <span
                                    className={`${styles.value} ${breakdowns.long.avg_pnl >= 0 ? styles.positive : styles.negative}`}
                                >
                                    {formatPnL(
                                        breakdowns.long.avg_pnl,
                                        currency,
                                        true
                                    )}
                                </span>
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.sideLabel}>Short</span>
                            <span className={styles.sideValues}>
                                <span className={styles.value}>
                                    {formatPercentage(
                                        breakdowns.short.win_percentage,
                                        0
                                    )}
                                </span>
                                <span className={styles.separator}>•</span>
                                <span
                                    className={`${styles.value} ${breakdowns.short.pnl >= 0 ? styles.positive : styles.negative}`}
                                >
                                    {formatPnL(
                                        breakdowns.short.pnl,
                                        currency,
                                        true
                                    )}
                                </span>
                                <span className={styles.separator}>•</span>
                                <span
                                    className={`${styles.value} ${breakdowns.short.avg_pnl >= 0 ? styles.positive : styles.negative}`}
                                >
                                    {formatPnL(
                                        breakdowns.short.avg_pnl,
                                        currency,
                                        true
                                    )}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Costs Breakdown */}
                <div className={styles.card}>
                    <div className={styles.tableHeader}>
                        <span className={styles.columnHeader}>Costs</span>
                        <span className={styles.columnHeader}>Value</span>
                    </div>
                    <div className={styles.tableBody}>
                        <div className={styles.row}>
                            <span className={styles.costLabel}>Commission</span>
                            <span className={styles.costValue}>
                                {formatPnL(costs.commission, currency, false)}
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.costLabel}>
                                Spread impact
                            </span>
                            <span className={styles.costValue}>
                                {formatPnL(
                                    costs.spread_impact,
                                    currency,
                                    false
                                )}
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.costLabel}>Slippage</span>
                            <span className={styles.costValue}>
                                {formatPnL(costs.slippage, currency, false)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
