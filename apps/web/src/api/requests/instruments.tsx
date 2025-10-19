import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  Instrument,
  InstrumentSchema,
  InstrumentListResponse,
  InstrumentListResponseSchema,
  CreateInstrumentRequest,
  CreateInstrumentRequestSchema,
  UpdateInstrumentRequest,
  UpdateInstrumentRequestSchema,
  PaginationQuery,
  PaginationQuerySchema,
} from "@backtrade/types";

// Instrument Management Hooks
export function useInstruments(query?: PaginationQuery) {
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

  return useGet<InstrumentListResponse>(url, {
    outputSchema: InstrumentListResponseSchema,
  });
}

export function useInstrument(id: string) {
  return useGet<Instrument>(`/instruments/${id}`, {
    outputSchema: InstrumentSchema,
  });
}

export function useCreateInstrument() {
  return usePost<Instrument, CreateInstrumentRequest>("/instruments", {
    inputSchema: CreateInstrumentRequestSchema,
    outputSchema: InstrumentSchema,
  });
}

export function useUpdateInstrument(id: string) {
  return usePut<Instrument, UpdateInstrumentRequest>(`/instruments/${id}`, {
    inputSchema: UpdateInstrumentRequestSchema,
    outputSchema: InstrumentSchema,
  });
}

export function useDeleteInstrument(id: string) {
  return useDelete<void>(`/instruments/${id}`);
}

export function useEnableInstrument(id: string) {
  return usePost<Instrument>(`/instruments/${id}/enable`, {
    outputSchema: InstrumentSchema,
  });
}

export function useDisableInstrument(id: string) {
  return usePost<Instrument>(`/instruments/${id}/disable`, {
    outputSchema: InstrumentSchema,
  });
}
