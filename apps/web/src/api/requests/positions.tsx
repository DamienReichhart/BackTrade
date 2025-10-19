import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  Position,
  PositionSchema,
  PositionListResponse,
  PositionListResponseSchema,
  CreatePositionRequest,
  CreatePositionRequestSchema,
  UpdatePositionRequest,
  UpdatePositionRequestSchema,
  DateRangeQuery,
  DateRangeQuerySchema,
} from "@backtrade/types";

// Position Management Hooks
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
  
  return useGet<PositionListResponse>(url, {
    outputSchema: PositionListResponseSchema,
  });
}

export function usePosition(id: string) {
  return useGet<Position>(`/positions/${id}`, {
    outputSchema: PositionSchema,
  });
}

export function usePositionsBySession(sessionId: string, query?: DateRangeQuery) {
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
  
  return useGet<PositionListResponse>(url, {
    outputSchema: PositionListResponseSchema,
  });
}

export function useCreatePosition() {
  return usePost<Position, CreatePositionRequest>("/positions", {
    inputSchema: CreatePositionRequestSchema,
    outputSchema: PositionSchema,
  });
}

export function useUpdatePosition(id: string) {
  return usePut<Position, UpdatePositionRequest>(`/positions/${id}`, {
    inputSchema: UpdatePositionRequestSchema,
    outputSchema: PositionSchema,
  });
}

export function useDeletePosition(id: string) {
  return useDelete<void>(`/positions/${id}`);
}

export function useClosePosition(id: string) {
  return usePost<Position>(`/positions/${id}/close`, {
    outputSchema: PositionSchema,
  });
}

export function useLiquidatePosition(id: string) {
  return usePost<Position>(`/positions/${id}/liquidate`, {
    outputSchema: PositionSchema,
  });
}
