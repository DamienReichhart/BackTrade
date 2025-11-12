/**
 * Format price for display
 *
 * @param price - Price value
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return price === 0 ? "Free" : `€${price}`;
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
