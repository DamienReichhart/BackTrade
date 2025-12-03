/**
 * Format amount value for display
 *
 * @param amount - Amount value
 * @returns Formatted amount string with 2 decimal places
 */
export function formatAmount(amount: number): string {
    return amount.toFixed(2);
}

/**
 * Get amount CSS class based on value
 *
 * @param amount - Amount value
 * @returns CSS class name for positive or negative amount
 */
export function getAmountClassName(amount: number): string {
    return amount >= 0 ? "amountPos" : "amountNeg";
}
