import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  Dataset,
  DatasetSchema,
  DatasetListResponse,
  DatasetListResponseSchema,
  CreateDatasetRequest,
  CreateDatasetRequestSchema,
  DateRangeQuery,
  DateRangeQuerySchema,
} from "@backtrade/types";

// Dataset Management Hooks
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
  
  return useGet<DatasetListResponse>(url, {
    outputSchema: DatasetListResponseSchema,
  });
}

export function useDataset(id: string) {
  return useGet<Dataset>(`/datasets/${id}`, {
    outputSchema: DatasetSchema,
  });
}

export function useDatasetsByInstrument(instrumentId: string, query?: DateRangeQuery) {
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
  
  return useGet<DatasetListResponse>(url, {
    outputSchema: DatasetListResponseSchema,
  });
}

export function useCreateDataset() {
  return usePost<Dataset, CreateDatasetRequest>("/datasets", {
    inputSchema: CreateDatasetRequestSchema,
    outputSchema: DatasetSchema,
  });
}

export function useUpdateDataset(id: string) {
  return usePut<Dataset, Partial<CreateDatasetRequest>>(`/datasets/${id}`, {
    outputSchema: DatasetSchema,
  });
}

export function useDeleteDataset(id: string) {
  return useDelete<void>(`/datasets/${id}`);
}

export function useActivateDataset(id: string) {
  return usePost<Dataset>(`/datasets/${id}/activate`, {
    outputSchema: DatasetSchema,
  });
}

export function useDeactivateDataset(id: string) {
  return usePost<Dataset>(`/datasets/${id}/deactivate`, {
    outputSchema: DatasetSchema,
  });
}
