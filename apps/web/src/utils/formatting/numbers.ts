/**
 * Formatting utilities for numbers
 */

/**
 * Format a number with locale-specific formatting
 *
 * @param value - Number to format
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export function formatNumber(
    value: number,
    options?: Intl.NumberFormatOptions
): string {
    return new Intl.NumberFormat(undefined, options).format(value);
}

/**
 * Format a number as percentage
 *
 * @param value - Value to format (e.g. 5.5 for 5.5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
}
