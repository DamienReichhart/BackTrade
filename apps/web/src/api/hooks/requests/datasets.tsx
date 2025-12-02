import { useGet, usePost, usePatch, useDelete, usePostForm } from "..";
import {
  DatasetSchema,
  DatasetListResponseSchema,
  CreateDatasetRequestSchema,
  UpdateDatasetRequestSchema,
  EmptyResponseSchema,
  type DateRangeQuery,
} from "@backtrade/types";

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

  return useGet(url, DatasetListResponseSchema);
}

export function useDataset(id: string) {
  return useGet(`/datasets/${id}`, DatasetSchema, { enabled: !!id });
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

  return useGet(url, DatasetListResponseSchema, { enabled: !!instrumentId });
}

export function useCreateDataset() {
  return usePost("/datasets", CreateDatasetRequestSchema, DatasetSchema);
}

export function useUpdateDataset(id: string) {
  return usePatch(`/datasets/${id}`, UpdateDatasetRequestSchema, DatasetSchema);
}

export function useDeleteDataset(id: string) {
  return useDelete(`/datasets/${id}`);
}

export function useUploadDataset(id: string) {
  return usePostForm(`/datasets/${id}/file`, EmptyResponseSchema);
}
