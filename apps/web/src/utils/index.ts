/**
 * Utility Functions
 */

export * from "./jwt";
export * from "./timeConvert";
export * from "./candles";
export * from "./cookies"

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

