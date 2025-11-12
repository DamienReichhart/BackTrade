/**
 * Format price with currency
 *
 * @param price - Price value
 * @param currency - ISO currency code (e.g., "EUR", "USD") or currency symbol (e.g., "€", "$")
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string): string {
  if (price === 0) {
    return "Free";
  }

  // If currency is a 3-letter ISO code, use Intl.NumberFormat
  if (currency.length === 3 && currency === currency.toUpperCase()) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(price);
  }

  // Otherwise, treat as symbol and format number with locale
  const formattedNumber = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  return `${currency}${formattedNumber}`;
}
