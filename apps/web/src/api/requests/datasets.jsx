import { useGet, usePost, usePut, useDelete } from "../hooks/index.jsx";

// Dataset Management Hooks
export function useDatasets(query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/datasets?${searchParams.toString()}` : "/datasets";

  return useGet(url);
}

export function useDataset(id) {
  return useGet(`/datasets/${id}`);
}

export function useDatasetsByInstrument(instrumentId, query) {
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

  return useGet(url);
}

export function useCreateDataset() {
  return usePost("/datasets");
}

export function useUpdateDataset(id) {
  return usePut(`/datasets/${id}`);
}

export function useDeleteDataset(id) {
  return useDelete(`/datasets/${id}`);
}

export function useActivateDataset(id) {
  return usePost(`/datasets/${id}/activate`);
}

export function useDeactivateDataset(id) {
  return usePost(`/datasets/${id}/deactivate`);
}
