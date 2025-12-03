import type { Position } from "@backtrade/types";

/**
 * Sortable field types for positions
 */
export type PositionSortField =
    | "id"
    | "side"
    | "quantity_lots"
    | "entry_price"
    | "realized_pnl"
    | "sl_price"
    | "tp_price"
    | "position_status"
    | "opened_at"
    | "closed_at";

/**
 * Sort order
 */
export type SortOrder = "asc" | "desc";

/**
 * Get the sortable value for a position field
 *
 * @param position - The position object
 * @param field - The field to extract
 * @returns The sortable value (number or string)
 */
function getSortValue(
    position: Position,
    field: PositionSortField
): number | string {
    switch (field) {
        case "id":
            return position.id;
        case "side":
            return position.side;
        case "quantity_lots":
            return position.quantity_lots;
        case "entry_price":
            return position.entry_price;
        case "realized_pnl":
            return position.realized_pnl ?? 0;
        case "sl_price":
            return position.sl_price ?? 0;
        case "tp_price":
            return position.tp_price ?? 0;
        case "position_status":
            return position.position_status;
        case "opened_at":
            return position.opened_at
                ? new Date(position.opened_at).getTime()
                : 0;
        case "closed_at":
            return position.closed_at
                ? new Date(position.closed_at).getTime()
                : 0;
        default:
            return 0;
    }
}

/**
 * Sort positions by field and order
 *
 * @param positions - Array of positions to sort
 * @param sortField - Field to sort by
 * @param sortOrder - Sort order (asc or desc)
 * @returns Sorted array of positions
 */
export function sortPositions(
    positions: Position[],
    sortField: PositionSortField,
    sortOrder: SortOrder
): Position[] {
    const sorted = [...positions];

    sorted.sort((a, b) => {
        const aValue = getSortValue(a, sortField);
        const bValue = getSortValue(b, sortField);

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    return sorted;
}
