import { useGet, usePost, usePatch, useDelete, usePostForm } from "..";
import {
    DatasetSchema,
    DatasetListResponseSchema,
    CreateDatasetRequestSchema,
    UpdateDatasetRequestSchema,
    EmptyResponseSchema,
    type DateRangeQuery,
} from "@backtrade/types";
import { buildUrlWithParams } from "../utils/url-params";

/**
 * Dataset Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useDatasets(query?: DateRangeQuery) {
    const url = buildUrlWithParams("/datasets", query);
    return useGet(url, DatasetListResponseSchema);
}

export function useDataset(id: string) {
    return useGet(`/datasets/${id}`, DatasetSchema, { enabled: !!id });
}

export function useDatasetsByInstrument(
    instrumentId: string,
    query?: DateRangeQuery
) {
    const url = buildUrlWithParams(
        `/instruments/${instrumentId}/datasets`,
        query
    );
    return useGet(url, DatasetListResponseSchema, { enabled: !!instrumentId });
}

export function useCreateDataset() {
    return usePost("/datasets", CreateDatasetRequestSchema, DatasetSchema);
}

export function useUpdateDataset(id: string) {
    return usePatch(
        `/datasets/${id}`,
        UpdateDatasetRequestSchema,
        DatasetSchema
    );
}

export function useDeleteDataset(id: string) {
    return useDelete(`/datasets/${id}`);
}

export function useUploadDataset(id: string) {
    return usePostForm(`/datasets/${id}/file`, EmptyResponseSchema);
}
