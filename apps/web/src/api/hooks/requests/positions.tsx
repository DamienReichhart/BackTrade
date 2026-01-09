import { useGet, usePost, usePatch, useDelete } from "..";
import {
    PositionSchema,
    PositionListResponseSchema,
    CreatePositionRequestSchema,
    CreatePositionResponseSchema,
    UpdatePositionRequestSchema,
    ClosePositionRequestSchema,
    EmptyResponseSchema,
    type PositionQuery,
    type PositionStatus,
} from "@backtrade/types";
import { z } from "zod";

/**
 * Position Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function usePositions(query?: PositionQuery) {
    const searchParams = new URLSearchParams();
    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        });
    }

    const url = query ? `/positions?${searchParams.toString()}` : "/positions";

    return useGet(url, PositionListResponseSchema);
}

export function usePosition(id: string) {
    return useGet(`/positions/${id}`, PositionSchema, { enabled: !!id });
}

/**
 * Fetch positions for a specific session with optional status filter.
 *
 * @param sessionId - The session ID to fetch positions for
 * @param status - Optional position status filter (OPEN, CLOSED, LIQUIDATED)
 * @returns Query result with positions array
 */
export function usePositionsBySession(
    sessionId: string,
    status?: PositionStatus
) {
    const searchParams = new URLSearchParams();
    if (status) {
        searchParams.append("status", status);
    }

    const queryString = searchParams.toString();
    const url = queryString
        ? `/sessions/${sessionId}/positions?${queryString}`
        : `/sessions/${sessionId}/positions`;

    return useGet(url, PositionListResponseSchema, { enabled: !!sessionId });
}

export function useCreatePosition() {
    return usePost(
        "/positions",
        CreatePositionRequestSchema,
        CreatePositionResponseSchema
    );
}

export function useUpdatePosition(id: string) {
    return usePatch(
        `/positions/${id}`,
        UpdatePositionRequestSchema,
        PositionSchema
    );
}

export function useDeletePosition(id: string) {
    return useDelete(`/positions/${id}`);
}

export function useClosePosition(id: string) {
    return usePatch(
        `/positions/${id}`,
        ClosePositionRequestSchema,
        PositionSchema
    );
}

export function useCloseAllPositions(sessionId: string) {
    return usePatch(
        `/sessions/${sessionId}/positions?closeAll=true`,
        z.object({}),
        EmptyResponseSchema
    );
}
