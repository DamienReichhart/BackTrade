/**
 * Format currency value for display
 *
 * @param value - Numeric value to format
 * @param currency - ISO currency code (default: "EUR")
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = "EUR"): string {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency,
    }).format(value);
}

/**
 * Format percentage value for display
 *
 * @param value - Numeric value to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`;
}
