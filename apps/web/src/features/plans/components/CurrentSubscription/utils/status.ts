import { getStatusColorClass } from "../../../utils/subscriptions";

/**
 * Get status color CSS class name
 *
 * @param status - Subscription status
 * @param styles - CSS module styles object
 * @returns CSS class name for status color
 */
export function getStatusColor(
    status: string,
    styles: Record<string, string>
): string {
    const colorClass = getStatusColorClass(status);
    return colorClass ? (styles[colorClass] ?? "") : "";
}
