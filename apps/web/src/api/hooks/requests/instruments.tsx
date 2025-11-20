import { useGet, usePost, usePatch, useDelete } from "..";
import {
  InstrumentSchema,
  InstrumentListResponseSchema,
  CreateInstrumentRequestSchema,
  UpdateInstrumentRequestSchema,
  EmptyResponseSchema,
  type SearchQuery,
  type Instrument,
} from "@backtrade/types";

/**
 * Instrument Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useInstruments(query?: SearchQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/instruments?${searchParams.toString()}`
    : "/instruments";

  return useGet(url, {
    outputSchema: InstrumentListResponseSchema,
  });
}

export function useInstrument(
  id: string,
  queryOptions?: { enabled?: boolean },
) {
  return useGet<Instrument>(`/instruments/${id}`, {
    outputSchema: InstrumentSchema,
    queryOptions: {
      enabled: queryOptions?.enabled ?? true,
      ...queryOptions,
    },
  });
}

export function useCreateInstrument() {
  return usePost("/instruments", {
    inputSchema: CreateInstrumentRequestSchema,
    outputSchema: InstrumentSchema,
  });
}

export function useUpdateInstrument(id: string) {
  return usePatch(`/instruments/${id}`, {
    inputSchema: UpdateInstrumentRequestSchema,
    outputSchema: InstrumentSchema,
  });
}

export function useDeleteInstrument(id: string) {
  return useDelete(`/instruments/${id}`, {
    outputSchema: EmptyResponseSchema,
  });
}

export function useEnableInstrument(id: string) {
  return usePost(`/instruments/${id}/enable`, {
    outputSchema: InstrumentSchema,
  });
}

export function useDisableInstrument(id: string) {
  return usePost(`/instruments/${id}/disable`, {
    outputSchema: InstrumentSchema,
  });
}
