import { useState, useMemo } from "react";
import type { Position, DailyPnL } from "@backtrade/types";
import { DataTable } from "../DataTable";
import {
    formatPnL,
    formatPercentage,
    formatTradeTime,
    formatTableDate,
} from "../../utils";
import styles from "./TradesSection.module.css";

/**
 * Trades view type
 */
type TradesView = "winners" | "losers" | "daily";

/**
 * TradesSection props interface
 */
interface TradesSectionProps {
    /**
     * Top winning trades
     */
    topWinners: Position[];

    /**
     * Worst losing trades
     */
    worstLosers: Position[];

    /**
     * Daily PnL data
     */
    dailyPnl: DailyPnL[];

    /**
     * Currency code for formatting
     * @default "EUR"
     */
    currency?: string;
}

/**
 * TradesSection component
 *
 * Displays tables for top winners, worst losers, and daily PnL
 */
export function TradesSection({
    topWinners,
    worstLosers,
    dailyPnl,
    currency = "EUR",
}: TradesSectionProps) {
    const [currentView, setCurrentView] = useState<TradesView>("winners");

    // Column definitions for trades table
    const tradesColumns = useMemo(
        () => [
            {
                header: "Time",
                accessor: (row: Position) =>
                    row.opened_at ? formatTradeTime(row.opened_at) : "—",
            },
            {
                header: "ID",
                accessor: (row: Position) => `#${row.id}`,
            },
            {
                header: "Symbol",
                accessor: "instrument_id" as keyof Position,
            },
            {
                header: "Side",
                accessor: (row: Position) => (
                    <span
                        className={
                            row.side === "BUY"
                                ? styles.sideBuy
                                : styles.sideSell
                        }
                    >
                        {row.side}
                    </span>
                ),
            },
            {
                header: "Qty",
                accessor: (row: Position) =>
                    Number(row.quantity_lots).toFixed(2),
            },
            {
                header: "Entry",
                accessor: (row: Position) =>
                    Number(row.entry_price).toLocaleString(),
                align: "right" as const,
            },
            {
                header: "Exit",
                accessor: (row: Position) =>
                    row.exit_price
                        ? Number(row.exit_price).toLocaleString()
                        : "—",
                align: "right" as const,
            },
            {
                header: "PnL",
                accessor: (row: Position) => {
                    if (row.realized_pnl === null) return "—";
                    const pnl =
                        typeof row.realized_pnl === "string"
                            ? parseFloat(row.realized_pnl)
                            : Number(row.realized_pnl);
                    return (
                        <span
                            className={
                                pnl >= 0
                                    ? styles.pnlPositive
                                    : styles.pnlNegative
                            }
                        >
                            {formatPnL(pnl, currency, true)}
                        </span>
                    );
                },
                align: "right" as const,
            },
        ],
        [currency]
    );

    // Column definitions for daily PnL table
    const dailyColumns = useMemo(
        () => [
            {
                header: "Date",
                accessor: (row: DailyPnL) => formatTableDate(row.date),
            },
            {
                header: "Trades",
                accessor: (row: DailyPnL) => row.trades.toString(),
                align: "center" as const,
            },
            {
                header: "Win Rate",
                accessor: (row: DailyPnL) => formatPercentage(row.win_rate, 0),
                align: "center" as const,
            },
            {
                header: "Gross PnL",
                accessor: (row: DailyPnL) =>
                    formatPnL(row.gross_pnl, currency, false),
                align: "right" as const,
            },
            {
                header: "Costs",
                accessor: (row: DailyPnL) =>
                    formatPnL(row.costs, currency, false),
                align: "right" as const,
            },
            {
                header: "Net PnL",
                accessor: (row: DailyPnL) => (
                    <span
                        className={
                            row.net_pnl >= 0
                                ? styles.pnlPositive
                                : styles.pnlNegative
                        }
                    >
                        {formatPnL(row.net_pnl, currency, true)}
                    </span>
                ),
                align: "right" as const,
            },
        ],
        [currency]
    );

    // Get current data based on view
    const getCurrentData = () => {
        switch (currentView) {
            case "winners":
                return topWinners;
            case "losers":
                return worstLosers;
            default:
                return [];
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <span className={styles.sectionLabel}>Trades</span>
                <div className={styles.tabs}>
                    <button
                        type="button"
                        className={`${styles.tab} ${currentView === "winners" ? styles.active : ""}`}
                        onClick={() => setCurrentView("winners")}
                    >
                        Top winners
                    </button>
                    <button
                        type="button"
                        className={`${styles.tab} ${currentView === "losers" ? styles.active : ""}`}
                        onClick={() => setCurrentView("losers")}
                    >
                        Worst losers
                    </button>
                    <button
                        type="button"
                        className={`${styles.tab} ${currentView === "daily" ? styles.active : ""}`}
                        onClick={() => setCurrentView("daily")}
                    >
                        Daily PnL
                    </button>
                </div>
            </div>

            <div className={styles.card}>
                {currentView === "daily" ? (
                    <DataTable
                        columns={dailyColumns}
                        data={dailyPnl}
                        keyAccessor="date"
                        emptyMessage="No daily PnL data"
                    />
                ) : (
                    <>
                        <h3 className={styles.tableTitle}>
                            {currentView === "winners"
                                ? "Top 10 winners"
                                : "Worst 10 losers"}
                        </h3>
                        <DataTable
                            columns={tradesColumns}
                            data={getCurrentData()}
                            keyAccessor="id"
                            emptyMessage={
                                currentView === "winners"
                                    ? "No winning trades"
                                    : "No losing trades"
                            }
                        />
                    </>
                )}
            </div>
        </section>
    );
}
