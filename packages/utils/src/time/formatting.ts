/**
 * Format a date to a readable format
 *
 * @param dateInput - Date object or ISO date string to format
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(dateInput: Date | string): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date to a readable date-time format
 *
 * @param dateInput - Date object or ISO date string to format
 * @returns Formatted date-time string (e.g., "Jan 15, 2024, 02:30:45 PM")
 */
export function formatDateTime(dateInput: Date | string): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Format a date to a readable time format
 *
 * @param dateInput - Date object or ISO date string to format
 * @returns Formatted time string (e.g., "02:30:45 PM")
 */
export function formatTime(dateInput: Date | string): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
