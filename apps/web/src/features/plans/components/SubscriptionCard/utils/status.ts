/**
 * Get status color CSS class name
 *
 * @param status - Subscription status
 * @param styles - CSS module styles object
 * @returns CSS class name for status color
 */
export function getStatusColor(
  status: string,
  styles: Record<string, string>,
): string {
  switch (status) {
    case "active":
      return styles.statusActive ?? "";
    case "trialing":
      return styles.statusTrialing ?? "";
    case "canceled":
      return styles.statusCanceled ?? "";
    case "active_unpaid":
      return styles.statusActiveUnpaid ?? "";
    default:
      return "";
  }
}
