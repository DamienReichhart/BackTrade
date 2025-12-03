import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { Position } from "@backtrade/types";
import { useSession } from "../../../../api/hooks/requests/sessions";
import { usePositionsBySession } from "../../../../api/hooks/requests/positions";
import { useModal } from "../../../../hooks/useModal";
import {
    sortPositions,
    type PositionSortField,
    type SortOrder,
} from "../utils/sorting";

/**
 * Hook to manage positions list data, sorting, and modal state
 *
 * @returns Positions list state and handlers
 */
export function usePositionsList() {
    const { id = "" } = useParams<{ id: string }>();
    const [sortField, setSortField] = useState<PositionSortField>("opened_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    const {
        isOpen,
        selectedItem: selectedPosition,
        openModal,
        closeModal,
    } = useModal<Position>();

    const { data: session } = useSession(id);
    const { data: positionsData, isLoading: isLoadingPositions } =
        usePositionsBySession(id);

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

    // Sort positions based on current sort field and order
    const sortedPositions = useMemo(() => {
        return sortPositions(positions, sortField, sortOrder);
    }, [positions, sortField, sortOrder]);

    /**
     * Handle column header click to toggle sorting
     */
    const handleSort = (field: PositionSortField) => {
        if (sortField === field) {
            // Toggle order if clicking the same field
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            // Set new field with default descending order
            setSortField(field);
            setSortOrder("desc");
        }
    };

    /**
     * Get sort indicator for column header
     */
    const getSortIndicator = (field: PositionSortField) => {
        if (sortField !== field) return null;
        return sortOrder === "asc" ? " ↑" : " ↓";
    };

    const handleRowClick = (position: Position) => {
        openModal(position);
    };

    return {
        session,
        positions,
        sortedPositions,
        isLoadingPositions,
        sortField,
        sortOrder,
        isModalOpen: isOpen,
        selectedPosition,
        handleSort,
        getSortIndicator,
        handleRowClick,
        closeModal,
    };
}
