import { formatDate } from "@backtrade/utils";
import type { Dataset } from "@backtrade/types";

/**
 * Formatting utilities for DatasetTable component
 */

/**
 * Format dataset date range
 */
export function formatDateRange(dataset: Dataset): string {
  const startDate = dataset.start_time ? formatDate(dataset.start_time) : "—";
  const endDate = dataset.end_time ? formatDate(dataset.end_time) : "—";
  return `${startDate} - ${endDate}`;
}
