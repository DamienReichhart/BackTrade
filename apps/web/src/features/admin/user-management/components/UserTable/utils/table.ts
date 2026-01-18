import type { SortField, SortOrder } from "../../../../hooks";

/**
 * Table utilities for UserTable component
 */

/**
 * Get sort indicator for column header
 *
 * @param field - The sort field to check
 * @param currentSortField - The currently active sort field
 * @param sortOrder - The current sort order
 * @returns Sort indicator character (↑ for asc, ↓ for desc) or null
 *
 * @example
 * ```tsx
 * const indicator = getSortIndicator("email", sortField, sortOrder);
 * // Returns "↑" if sorting by email ascending, "↓" if descending, null otherwise
 * ```
 */
export function getSortIndicator(
    field: SortField,
    currentSortField: SortField,
    sortOrder: SortOrder
): string | null {
    if (currentSortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
}
