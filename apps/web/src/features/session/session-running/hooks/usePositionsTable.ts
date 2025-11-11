import { useParams, useNavigate } from "react-router-dom";
import type { Position } from "@backtrade/types";
import { useModal } from "../../../../hooks/useModal";
import { useCurrentSessionStore } from "../../../../context/CurrentSessionContext";
import { usePositionsBySession } from "../../../../api/hooks/requests/positions";

/**
 * Hook to manage positions table data and interactions
 *
 * @returns Positions table state and handlers
 */
export function usePositionsTable() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSession } = useCurrentSessionStore();
  const sessionId = currentSession ? String(currentSession.id) : id;
  const hasValidSession = !!sessionId && sessionId !== "";

  const {
    isOpen,
    selectedItem: selectedPosition,
    openModal,
    closeModal,
  } = useModal<Position>();

  const { data: positionsData, isLoading: loading } = usePositionsBySession(
    sessionId,
    undefined,
    { enabled: hasValidSession },
  );

  const positions: Position[] = Array.isArray(positionsData)
    ? positionsData.map((p) => ({
        ...p,
        realized_pnl: p.realized_pnl ?? 0,
        commission_cost: p.commission_cost ?? 0,
        slippage_cost: p.slippage_cost ?? 0,
        spread_cost: p.spread_cost ?? 0,
        created_at: p.created_at ?? "",
        updated_at: p.updated_at ?? "",
      }))
    : [];

  // Filter to show only OPEN positions
  const openPositions = positions.filter((p) => p.position_status === "OPEN");

  const handleRowClick = (position: Position) => {
    openModal(position);
  };

  const handleManageClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!hasValidSession) {
      return;
    }
    navigate(`/sessions/${sessionId}/positions/list`);
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
