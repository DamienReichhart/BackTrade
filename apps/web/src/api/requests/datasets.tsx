import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  DatasetSchema,
  DatasetListResponseSchema,
  CreateDatasetRequestSchema,
  UpdateDatasetRequestSchema,
  type DateRangeQuery,
} from "@backtrade/types";
import { z } from "zod";

/**
 * Dataset Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useDatasets(query?: DateRangeQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/datasets?${searchParams.toString()}` : "/datasets";

  return useGet(url, {
    outputSchema: DatasetListResponseSchema,
  });
}

export function useDataset(id: string) {
  return useGet(`/datasets/${id}`, {
    outputSchema: DatasetSchema,
  });
}

export function useDatasetsByInstrument(
  instrumentId: string,
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
    ? `/instruments/${instrumentId}/datasets?${searchParams.toString()}`
    : `/instruments/${instrumentId}/datasets`;

  return useGet(url, {
    outputSchema: DatasetListResponseSchema,
  });
}

export function useCreateDataset() {
  return usePost("/datasets", {
    inputSchema: CreateDatasetRequestSchema,
    outputSchema: DatasetSchema,
  });
}

export function useUpdateDataset(id: string) {
  return usePut(`/datasets/${id}`, {
    inputSchema: UpdateDatasetRequestSchema,
    outputSchema: DatasetSchema,
  });
}

export function useDeleteDataset(id: string) {
  return useDelete(`/datasets/${id}`, {
    outputSchema: z.void(),
  });
}

export function useActivateDataset(id: string) {
  return usePost(`/datasets/${id}/activate`, {
    outputSchema: DatasetSchema,
  });
}

export function useDeactivateDataset(id: string) {
  return usePost(`/datasets/${id}/deactivate`, {
    outputSchema: DatasetSchema,
  });
}
