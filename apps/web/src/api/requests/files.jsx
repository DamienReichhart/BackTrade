import { useGet, usePost, usePut, useDelete } from "../hooks/index.jsx";

// File Management Hooks
export function useFiles(query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/files?${searchParams.toString()}` : "/files";

  return useGet(url);
}

export function useFile(id) {
  return useGet(`/files/${id}`);
}

export function useFilesByEntity(entityId, query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/entities/${entityId}/files?${searchParams.toString()}`
    : `/entities/${entityId}/files`;

  return useGet(url);
}

export function useCreateFile() {
  return usePost("/files");
}

export function useUpdateFile(id) {
  return usePut(`/files/${id}`);
}

export function useDeleteFile(id) {
  return useDelete(`/files/${id}`);
}

export function useUploadFile() {
  return usePost("/files/upload");
}

export function useDownloadFile(id) {
  return useGet(`/files/${id}/download`);
}
