import { formatDate } from "@backtrade/utils";
import type { Dataset } from "@backtrade/types";

/**
 * Formatting utilities for DatasetTable component
 */

/**
 * Get status badge class name
 */
export function getStatusBadgeClassName(isActive: boolean): string {
  return isActive ? "activeBadge" : "inactiveBadge";
}

/**
 * Get status label
 */
export function getStatusLabel(isActive: boolean): string {
  return isActive ? "Active" : "Inactive";
}

/**
 * Format dataset date range
 */
export function formatDateRange(dataset: Dataset): string {
  const startDate = dataset.start_ts ? formatDate(dataset.start_ts) : "—";
  const endDate = dataset.end_ts ? formatDate(dataset.end_ts) : "—";
  return `${startDate} - ${endDate}`;
}
