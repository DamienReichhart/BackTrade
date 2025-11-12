/**
 * Format currency value for display
 *
 * @param value - Numeric value to format
 * @param currency - Currency symbol (default: "€")
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = "€"): string {
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
