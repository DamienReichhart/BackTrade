import { useMemo } from "react";
import { useParams } from "react-router-dom";
import type { Position, PositionQuery } from "@backtrade/types";
import { usePositionsBySession } from "../../../../api/hooks/requests/positions";
import { useCurrentSessionStore } from "../../../../store/session";

export interface UseSessionPositionsResult {
    positions: Position[];
    isLoading: boolean;
    hasValidSession: boolean;
    sessionId: string;
}

/**
 * Fetch and normalize open positions for the current session.
 *
 * This hook fetches only OPEN positions from the server for use on the session page.
 * No pagination limit is applied - fetches all open positions.
 * For viewing all positions (including closed) with pagination, use the positions list page.
 */
export function useSessionPositions(): UseSessionPositionsResult {
    const { id = "" } = useParams<{ id: string }>();
    const { currentSession } = useCurrentSessionStore();
    const sessionId = currentSession ? String(currentSession.id) : id;
    const hasValidSession = sessionId !== "";

    // Query to fetch all open positions with no limit
    const query: PositionQuery = useMemo(
        () => ({
            status: "OPEN",
            page: 1,
            limit: 100,
            order: "desc",
        }),
        []
    );

    const { data: positionsData, isLoading } = usePositionsBySession(
        sessionId,
        query
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
