import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  PositionSchema,
  PositionListResponseSchema,
  CreatePositionRequestSchema,
  UpdatePositionRequestSchema,
  EmptyResponseSchema,
  type DateRangeQuery,
} from "@backtrade/types";

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

  return useGet(url, {
    outputSchema: PositionListResponseSchema,
  });
}

export function usePosition(id: string) {
  return useGet(`/positions/${id}`, {
    outputSchema: PositionSchema,
  });
}

export function usePositionsBySession(
  sessionId: string,
  query?: DateRangeQuery,
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

  return useGet(url, {
    outputSchema: PositionListResponseSchema,
  });
}

export function useCreatePosition() {
  return usePost("/positions", {
    inputSchema: CreatePositionRequestSchema,
    outputSchema: PositionSchema,
  });
}

export function useUpdatePosition(id: string) {
  return usePut(`/positions/${id}`, {
    inputSchema: UpdatePositionRequestSchema,
    outputSchema: PositionSchema,
  });
}

export function useDeletePosition(id: string) {
  return useDelete(`/positions/${id}`, {
    outputSchema: EmptyResponseSchema,
  });
}

export function useClosePosition(id: string) {
  return usePost(`/positions/${id}/close`, {
    outputSchema: PositionSchema,
  });
}

export function useLiquidatePosition(id: string) {
  return usePost(`/positions/${id}/liquidate`, {
    outputSchema: PositionSchema,
  });
}
