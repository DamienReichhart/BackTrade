import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  CandleSchema,
  CandleListResponseSchema,
  CreateCandleRequestSchema,
  type DateRangeQuery,
} from "@backtrade/types";
import { z } from "zod";

/**
 * Candle Management API Hooks
 * Schemas are defined once and automatically applied
 */

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

  return useGet(url, {
    outputSchema: CandleListResponseSchema,
  });
}

export function useCandle(id: string) {
  return useGet(`/candles/${id}`, {
    outputSchema: CandleSchema,
  });
}

export function useCandlesByInstrument(
  instrumentId: string,
  timeframe: string,
  query?: DateRangeQuery,
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

  return useGet(url, {
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

  return useGet(url, {
    outputSchema: CandleListResponseSchema,
  });
}

export function useCreateCandle() {
  return usePost("/candles", {
    inputSchema: CreateCandleRequestSchema,
    outputSchema: CandleSchema,
  });
}

export function useCreateCandles() {
  return usePost("/candles/bulk", {
    outputSchema: z.array(CandleSchema),
  });
}

export function useUpdateCandle(id: string) {
  return usePut(`/candles/${id}`, {
    outputSchema: CandleSchema,
  });
}

export function useDeleteCandle(id: string) {
  return useDelete(`/candles/${id}`, {
    outputSchema: z.void(),
  });
}
