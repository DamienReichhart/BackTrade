import { useGet } from "..";
import {
  CandleSchema,
  CandleListResponseSchema,
  type DateRangeQuery,
} from "@backtrade/types";

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
  enabled?: boolean,
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
    queryOptions: enabled !== undefined ? { enabled } : undefined,
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

export function useCandlesBySession(id: string) {
  return useGet(`/sessions/${id}/candles`, {
    outputSchema: CandleListResponseSchema,
    queryOptions: {
      enabled: !!id && id !== "",
    },
  });
}
