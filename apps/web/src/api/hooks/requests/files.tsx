import { useGet, usePost, usePatch, useDelete } from "..";
import {
  FileSchema,
  FileListResponseSchema,
  CreateFileRequestSchema,
  UpdateFileRequestSchema,
  FileUploadRequestSchema,
  FileUploadResponseSchema,
  EmptyResponseSchema,
  type SearchQuery,
} from "@backtrade/types";

/**
 * File Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useFiles(query: SearchQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/files?${searchParams.toString()}` : "/files";

  return useGet(url, {
    outputSchema: FileListResponseSchema,
  });
}

export function useFile(id: string) {
  return useGet(`/files/${id}`, {
    outputSchema: FileSchema,
  });
}

export function useFilesByEntity(entityId: string, query: SearchQuery) {
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

  return useGet(url, {
    outputSchema: FileListResponseSchema,
  });
}

export function useCreateFile() {
  return usePost("/files", {
    inputSchema: CreateFileRequestSchema,
    outputSchema: FileSchema,
  });
}

export function useUpdateFile(id: string) {
  return usePatch(`/files/${id}`, {
    inputSchema: UpdateFileRequestSchema,
    outputSchema: FileSchema,
  });
}

export function useDeleteFile(id: string) {
  return useDelete(`/files/${id}`, {
    outputSchema: EmptyResponseSchema,
  });
}

export function useUploadFile() {
  return usePost("/files/upload", {
    inputSchema: FileUploadRequestSchema,
    outputSchema: FileUploadResponseSchema,
  });
}

export function useDownloadFile(id: string) {
  return useGet(`/files/${id}/download`);
}
