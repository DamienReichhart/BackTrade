/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string): string {
  return `${currency}${price}`;
}
