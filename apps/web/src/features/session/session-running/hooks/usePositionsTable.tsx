import { useNavigate } from "react-router-dom";
import type { Position } from "@backtrade/types";
import { useModal } from "../../../../hooks/useModal";
import { useSessionPositions } from "./useSessionPositions";

/**
 * Hook to manage positions table data and interactions
 *
 * Positions are fetched server-side with status=OPEN filter via useSessionPositions.
 *
 * @returns Positions table state and handlers
 */
export function usePositionsTable() {
    const navigate = useNavigate();
    const {
        positions: openPositions,
        isLoading: loading,
        hasValidSession,
        sessionId,
    } = useSessionPositions();

    const {
        isOpen,
        selectedItem: selectedPosition,
        openModal,
        closeModal,
    } = useModal<Position>();

    const handleRowClick = (position: Position) => {
        openModal(position);
    };

    const handleManageClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!hasValidSession) {
            return;
        }
        navigate(`/dashboard/sessions/${sessionId}/positions/list`);
    };

    return {
        openPositions,
        loading,
        isModalOpen: isOpen,
        selectedPosition,
        handleRowClick,
        handleManageClick,
        closeModal,
    };
}
