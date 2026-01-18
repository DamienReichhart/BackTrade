import { formatDate } from "@backtrade/utils";

/**
 * Format period range for display
 *
 * @param start - Start date string
 * @param end - End date string
 * @returns Formatted period string
 */
export function formatPeriod(start: string, end: string): string {
    return `${formatDate(start)} - ${formatDate(end)}`;
}
