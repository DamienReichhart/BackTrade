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
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(undefined, options).format(value);
}
