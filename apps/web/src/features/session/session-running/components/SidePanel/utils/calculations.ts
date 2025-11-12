/**
 * Calculate if order form is disabled
 *
 * @param hasSession - Whether session exists
 * @param hasPrice - Whether current price exists
 * @param isCreating - Whether position is being created
 * @param qty - Order quantity
 * @returns Whether form should be disabled
 */
export function isOrderFormDisabled(
  hasSession: boolean,
  hasPrice: boolean,
  isCreating: boolean,
  qty: number,
): boolean {
  return !hasSession || !hasPrice || isCreating || qty <= 0;
}
