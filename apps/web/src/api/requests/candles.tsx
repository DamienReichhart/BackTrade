import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  Candle,
  CandleSchema,
  CandleListResponse,
  CandleListResponseSchema,
  CreateCandleRequest,
  CreateCandleRequestSchema,
  DateRangeQuery,
  DateRangeQuerySchema,
} from "@backtrade/types";

// Candle Management Hooks
export function useCandles(query?: DateRangeQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }
  
  const url = query ? `/candles?${searchParams.toString()}` : "/candles";
  
  return useGet<CandleListResponse>(url, {
    outputSchema: CandleListResponseSchema,
  });
}

export function useCandle(id: string) {
  return useGet<Candle>(`/candles/${id}`, {
    outputSchema: CandleSchema,
  });
}

export function useCandlesByInstrument(
  instrumentId: string, 
  timeframe: string, 
  query?: DateRangeQuery
) {
  const searchParams = new URLSearchParams();
  searchParams.append("timeframe", timeframe);
  
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }
  
  const url = `/instruments/${instrumentId}/candles?${searchParams.toString()}`;
  
  return useGet<CandleListResponse>(url, {
    outputSchema: CandleListResponseSchema,
  });
}

export function useCandlesByDataset(datasetId: string, query?: DateRangeQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }
  
  const url = query 
    ? `/datasets/${datasetId}/candles?${searchParams.toString()}` 
    : `/datasets/${datasetId}/candles`;
  
  return useGet<CandleListResponse>(url, {
    outputSchema: CandleListResponseSchema,
  });
}

export function useCreateCandle() {
  return usePost<Candle, CreateCandleRequest>("/candles", {
    inputSchema: CreateCandleRequestSchema,
    outputSchema: CandleSchema,
  });
}

export function useCreateCandles() {
  return usePost<Candle[], CreateCandleRequest[]>("/candles/bulk", {
    outputSchema: CandleSchema.array(),
  });
}

export function useUpdateCandle(id: string) {
  return usePut<Candle, Partial<CreateCandleRequest>>(`/candles/${id}`, {
    outputSchema: CandleSchema,
  });
}

export function useDeleteCandle(id: string) {
  return useDelete<void>(`/candles/${id}`);
}
