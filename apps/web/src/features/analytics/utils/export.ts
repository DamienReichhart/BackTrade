/**
 * Analytics export utilities
 */

import type { SessionAnalyticsResponse } from "@backtrade/types";

/**
 * Generate CSV content from analytics data
 *
 * @param analytics - Session analytics response data
 * @returns CSV formatted string
 */
export function generateAnalyticsCsv(
    analytics: SessionAnalyticsResponse
): string {
    const rows: string[] = [];

    // Summary section
    rows.push("=== PERFORMANCE SUMMARY ===");
    rows.push("Metric,Value");
    rows.push(`Total Trades,${analytics.summary.total_trades}`);
    rows.push(`Net PnL,${analytics.summary.net_pnl}`);
    rows.push(`Return %,${analytics.summary.return_percentage}`);
    rows.push(`Win Rate,${analytics.summary.win_rate}`);
    rows.push(`Profit Factor,${analytics.summary.profit_factor}`);
    rows.push(`Max Drawdown,${analytics.summary.max_drawdown}`);
    rows.push(`Sharpe Ratio,${analytics.summary.sharpe_ratio}`);
    rows.push(`Sortino Ratio,${analytics.summary.sortino_ratio}`);
    rows.push("");

    // Daily PnL section
    rows.push("=== DAILY PNL ===");
    rows.push("Date,Trades,Win Rate,Gross PnL,Costs,Net PnL");
    for (const day of analytics.daily_pnl) {
        rows.push(
            `${day.date},${day.trades},${day.win_rate},${day.gross_pnl},${day.costs},${day.net_pnl}`
        );
    }
    rows.push("");

    // Top winners
    rows.push("=== TOP WINNERS ===");
    rows.push("ID,Side,Realized PnL");
    for (const trade of analytics.top_winners) {
        rows.push(`${trade.id},${trade.side},${trade.realized_pnl}`);
    }
    rows.push("");

    // Worst losers
    rows.push("=== WORST LOSERS ===");
    rows.push("ID,Side,Realized PnL");
    for (const trade of analytics.worst_losers) {
        rows.push(`${trade.id},${trade.side},${trade.realized_pnl}`);
    }

    return rows.join("\n");
}

/**
 * Download content as a CSV file
 *
 * @param content - CSV content string
 * @param filename - Name of the file to download
 */
export function downloadCsv(content: string, filename: string): void {
    const blob = new Blob([content], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Export analytics data as CSV file
 *
 * @param analytics - Session analytics response data
 * @param sessionId - Session ID for filename
 */
export function exportAnalyticsCsv(
    analytics: SessionAnalyticsResponse,
    sessionId: string
): void {
    const csvContent = generateAnalyticsCsv(analytics);
    downloadCsv(csvContent, `session-${sessionId}-analytics.csv`);
}
