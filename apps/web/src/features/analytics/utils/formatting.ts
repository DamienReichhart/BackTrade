/**
 * Analytics formatting utilities
 */

/**
 * Format currency with sign indicator for PnL values
 *
 * @param value - Numeric value
 * @param currency - Currency code (default: EUR)
 * @param showSign - Whether to show + prefix for positive values
 * @returns Formatted currency string
 */
export function formatPnL(
    value: number,
    currency: string = "EUR",
    showSign: boolean = true
): string {
    const formatted = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency,
        signDisplay: showSign ? "exceptZero" : "auto",
    }).format(value);

    return formatted;
}

/**
 * Format percentage with specified decimals
 *
 * @param value - Percentage value (e.g., 14.58 for 14.58%)
 * @param decimals - Number of decimal places
 * @param showSign - Whether to show + prefix for positive values
 * @returns Formatted percentage string
 */
export function formatPercentage(
    value: number,
    decimals: number = 2,
    showSign: boolean = false
): string {
    const sign = showSign && value > 0 ? "+" : "";
    return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format ratio value (e.g., Sharpe, Sortino, Profit Factor)
 *
 * @param value - Ratio value
 * @param decimals - Number of decimal places
 * @returns Formatted ratio string
 */
export function formatRatio(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
}

/**
 * Format a single date for table display
 *
 * @param date - Date string
 * @returns Formatted date string
 */
export function formatTableDate(date: string): string {
    return new Date(date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

/**
 * Format datetime for trade entries
 *
 * @param datetime - Datetime string
 * @returns Formatted datetime string
 */
export function formatTradeTime(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}
