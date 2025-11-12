/**
 * Format plan title for display
 *
 * @param planCode - Plan code (optional)
 * @param planId - Plan ID as fallback
 * @returns Formatted plan title
 */
export function formatPlanTitle(
  planCode: string | undefined,
  planId: number,
): string {
  return planCode ? planCode.toUpperCase() : `Plan #${planId}`;
}
