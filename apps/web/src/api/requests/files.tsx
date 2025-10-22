import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  type File,
  FileSchema,
  type FileListResponse,
  FileListResponseSchema,
  type CreateFileRequest,
  CreateFileRequestSchema,
  type FileUploadResponse,
  FileUploadResponseSchema,
  type PaginationQuery,
} from "@backtrade/types";

// File Management Hooks
export function useFiles(query?: PaginationQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/files?${searchParams.toString()}` : "/files";

  return useGet<FileListResponse>(url, {
    outputSchema: FileListResponseSchema,
  });
}

export function useFile(id: string) {
  return useGet<File>(`/files/${id}`, {
    outputSchema: FileSchema,
  });
}

export function useFilesByEntity(entityId: string, query?: PaginationQuery) {
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

  return useGet<FileListResponse>(url, {
    outputSchema: FileListResponseSchema,
  });
}

export function useCreateFile() {
  return usePost<File, CreateFileRequest>("/files", {
    inputSchema: CreateFileRequestSchema,
    outputSchema: FileSchema,
  });
}

export function useUpdateFile(id: string) {
  return usePut<File, Partial<CreateFileRequest>>(`/files/${id}`, {
    outputSchema: FileSchema,
  });
}

export function useDeleteFile(id: string) {
  return useDelete<void>(`/files/${id}`);
}

export function useUploadFile() {
  return usePost<FileUploadResponse, FormData>("/files/upload", {
    outputSchema: FileUploadResponseSchema,
  });
}

export function useDownloadFile(id: string) {
  return useGet<Blob>(`/files/${id}/download`);
}
