import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { Position, PositionQuery, SortOrder } from "@backtrade/types";
import { useSession } from "../../../../api/hooks/requests/sessions";
import { usePositionsBySession } from "../../../../api/hooks/requests/positions";
import { useModal } from "../../../../hooks/useModal";
import type { PositionSortField } from "../utils/sorting";

/**
 * Hook to manage positions list data, sorting, pagination, and modal state
 *
 * @returns Positions list state and handlers
 */
export function usePositionsList() {
    const { id = "" } = useParams<{ id: string }>();
    const [sortField, setSortField] = useState<string>("opened_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [page, setPage] = useState<number>(1);
    const limit = 30;

    const {
        isOpen,
        selectedItem: selectedPosition,
        openModal,
        closeModal,
    } = useModal<Position>();

    const { data: session } = useSession(id);

    // Build query with pagination and sorting
    const query: PositionQuery = useMemo(
        () => ({
            page,
            limit,
            sort: sortField,
            order: sortOrder,
        }),
        [page, limit, sortField, sortOrder]
    );

    const { data: positionsData, isLoading: isLoadingPositions } =
        usePositionsBySession(id, query);

    // Normalize positions data
    const positions: Position[] = useMemo(() => {
        if (!Array.isArray(positionsData)) return [];

        return positionsData.map((p) => ({
            ...p,
            realized_pnl: p.realized_pnl ?? 0,
            commission_cost: p.commission_cost ?? 0,
            slippage_cost: p.slippage_cost ?? 0,
            spread_cost: p.spread_cost ?? 0,
            created_at: p.created_at ?? "",
            updated_at: p.updated_at ?? "",
        }));
    }, [positionsData]);

    /**
     * Handle column header click to toggle sorting
     */
    const handleSort = (field: PositionSortField) => {
        const fieldString = field as string;
        if (sortField === fieldString) {
            // Toggle order if clicking the same field
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            // Set new field with default descending order
            setSortField(fieldString);
            setSortOrder("desc");
        }
        setPage(1); // Reset to first page on sort change
    };

    /**
     * Get sort indicator for column header
     */
    const getSortIndicator = (field: PositionSortField) => {
        if (sortField !== (field as string)) return null;
        return sortOrder === "asc" ? " ↑" : " ↓";
    };

    const handleRowClick = (position: Position) => {
        openModal(position);
    };

    return {
        session,
        positions,
        isLoadingPositions,
        sortField,
        sortOrder,
        page,
        limit,
        setPage,
        isModalOpen: isOpen,
        selectedPosition,
        handleSort,
        getSortIndicator,
        handleRowClick,
        closeModal,
    };
}
