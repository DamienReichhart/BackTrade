/**
 * Format price for display
 *
 * @param price - Price value
 * @param currency - ISO currency code (e.g., "EUR", "USD")
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string): string {
  if (price === 0) {
    return "Free";
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency,
  }).format(price);
}

/**
 * Get button text based on whether plan is current
 *
 * @param isCurrent - Whether the plan is the current plan
 * @returns Button text
 */
export function getButtonText(isCurrent: boolean): string {
  return isCurrent ? "Current Plan" : "Select Plan";
}
