import { useMemo } from "react";
import { useParams } from "react-router-dom";
import type { Position } from "@backtrade/types";
import { usePositionsBySession } from "../../../../api/hooks/requests/positions";
import { useCurrentSessionStore } from "../../../../store/session";

export interface UseSessionPositionsResult {
    positions: Position[];
    isLoading: boolean;
    hasValidSession: boolean;
    sessionId: string;
}

/**
 * Fetch and normalize all positions tied to the current session.
 *
 * Centralizing this logic keeps components focused on rendering while hooks
 * coordinate data fetching and cleanup.
 */
export function useSessionPositions(): UseSessionPositionsResult {
    const { id = "" } = useParams<{ id: string }>();
    const { currentSession } = useCurrentSessionStore();
    const sessionId = currentSession ? String(currentSession.id) : id;
    const hasValidSession = sessionId !== "";

    const { data: positionsData, isLoading } = usePositionsBySession(
        sessionId,
        undefined
    );

    const positions = useMemo<Position[]>(() => {
        if (!Array.isArray(positionsData)) {
            return [];
        }

        return positionsData.map((position) => ({
            ...position,
            realized_pnl: position.realized_pnl ?? 0,
            commission_cost: position.commission_cost ?? 0,
            slippage_cost: position.slippage_cost ?? 0,
            spread_cost: position.spread_cost ?? 0,
            created_at: position.created_at ?? "",
            updated_at: position.updated_at ?? "",
        }));
    }, [positionsData]);

    return {
        positions,
        isLoading,
        hasValidSession,
        sessionId,
    };
}
