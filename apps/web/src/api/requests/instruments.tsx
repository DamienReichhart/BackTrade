import { useGet, usePost, usePut, useDelete } from '../hooks';
import {
  InstrumentSchema,
  InstrumentListResponseSchema,
  CreateInstrumentRequestSchema,
  UpdateInstrumentRequestSchema,
  type PaginationQuery,
} from '@backtrade/types';
import { z } from 'zod';

/**
 * Instrument Management API Hooks
 * Schemas are defined once and automatically applied
 */

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
    : '/instruments';

  return useGet(url, {
    outputSchema: InstrumentListResponseSchema,
  });
}

export function useInstrument(id: string) {
  return useGet(`/instruments/${id}`, {
    outputSchema: InstrumentSchema,
  });
}

export function useCreateInstrument() {
  return usePost('/instruments', {
    inputSchema: CreateInstrumentRequestSchema,
    outputSchema: InstrumentSchema,
  });
}

export function useUpdateInstrument(id: string) {
  return usePut(`/instruments/${id}`, {
    inputSchema: UpdateInstrumentRequestSchema,
    outputSchema: InstrumentSchema,
  });
}

export function useDeleteInstrument(id: string) {
  return useDelete(`/instruments/${id}`, {
    outputSchema: z.void(),
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
