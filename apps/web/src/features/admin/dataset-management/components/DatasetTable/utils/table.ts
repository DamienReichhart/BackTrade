import type { SortField, SortOrder } from "../../../hooks";

/**
 * Table utilities for DatasetTable component
 */

/**
 * Get sort indicator for column header
 *
 * @param field - The sort field to check
 * @param currentSortField - The currently active sort field
 * @param sortOrder - The current sort order
 * @returns Sort indicator character (↑ for asc, ↓ for desc) or null
 */
export function getSortIndicator(
    field: SortField,
    currentSortField: SortField,
    sortOrder: SortOrder
): string | null {
    if (currentSortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
}
