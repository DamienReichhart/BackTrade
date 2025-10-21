import { useGet, usePost, usePut, useDelete } from "../hooks/index.jsx";

// Candle Management Hooks
export function useCandles(query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/candles?${searchParams.toString()}` : "/candles";

  return useGet(url);
}

export function useCandle(id) {
  return useGet(`/candles/${id}`);
}

export function useCandlesByInstrument(instrumentId, timeframe, query) {
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

  return useGet(url);
}

export function useCandlesByDataset(datasetId, query) {
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

  return useGet(url);
}

export function useCreateCandle() {
  return usePost("/candles");
}

export function useCreateCandles() {
  return usePost("/candles/bulk");
}

export function useUpdateCandle(id) {
  return usePut(`/candles/${id}`);
}

export function useDeleteCandle(id) {
  return useDelete(`/candles/${id}`);
}
