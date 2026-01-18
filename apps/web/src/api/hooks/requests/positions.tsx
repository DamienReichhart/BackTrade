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
} from "@backtrade/types";
import { z } from "zod";
import { buildUrlWithParams } from "../utils/url-params";

/**
 * Position Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function usePositions(query?: PositionQuery) {
    const url = buildUrlWithParams("/positions", query);
    return useGet(url, PositionListResponseSchema);
}

export function usePosition(id: string) {
    return useGet(`/positions/${id}`, PositionSchema, { enabled: !!id });
}

/**
 * Fetch positions for a specific session with optional status filter, pagination, and sorting.
 *
 * @param sessionId - The session ID to fetch positions for
 * @param query - Optional query with status filter, pagination, and sorting
 * @returns Query result with positions array
 */
export function usePositionsBySession(
    sessionId: string,
    query?: PositionQuery
) {
    const url = buildUrlWithParams(`/sessions/${sessionId}/positions`, query);
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
