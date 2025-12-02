import { useGet, usePost, usePatch, useDelete } from "..";
import {
    PositionSchema,
    PositionListResponseSchema,
    CreatePositionRequestSchema,
    CreatePositionResponseSchema,
    UpdatePositionRequestSchema,
    ClosePositionRequestSchema,
    EmptyResponseSchema,
    type DateRangeQuery,
} from "@backtrade/types";
import { z } from "zod";

/**
 * Position Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function usePositions(query?: DateRangeQuery) {
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

export function usePositionsBySession(
    sessionId: string,
    query?: DateRangeQuery
) {
    const searchParams = new URLSearchParams();
    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        });
    }

    const url = query
        ? `/sessions/${sessionId}/positions?${searchParams.toString()}`
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
