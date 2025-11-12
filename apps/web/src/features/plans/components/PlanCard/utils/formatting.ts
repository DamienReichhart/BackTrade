/**
 * Re-export formatPrice from shared utilities
 */
export { formatPrice } from "../../../../../utils/formatting";

/**
 * Get button text based on whether plan is current
 *
 * @param isCurrent - Whether the plan is the current plan
 * @returns Button text
 */
export function getButtonText(isCurrent: boolean): string {
  return isCurrent ? "Current Plan" : "Select Plan";
}
