import { useGet, usePost, usePatch, useDelete } from "..";
import {
  SessionSchema,
  SessionListResponseSchema,
  CreateSessionRequestSchema,
  UpdateSessionRequestSchema,
  EmptyResponseSchema,
  type DateRangeQuery,
} from "@backtrade/types";

/**
 * Session Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useSessions(query?: DateRangeQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/sessions?${searchParams.toString()}` : "/sessions";

  return useGet(url, {
    outputSchema: SessionListResponseSchema,
  });
}

export function useSession(id: string) {
  return useGet(`/sessions/${id}`, {
    outputSchema: SessionSchema,
    queryOptions: {
      enabled: !!id && id !== "",
    },
  });
}

export function useCreateSession() {
  return usePost("/sessions", {
    inputSchema: CreateSessionRequestSchema,
    outputSchema: SessionSchema,
  });
}

export function useUpdateSession(id: string) {
  return usePatch(`/sessions/${id}`, {
    inputSchema: UpdateSessionRequestSchema,
    outputSchema: SessionSchema,
  });
}

export function useDeleteSession(id: string) {
  return useDelete(`/sessions/${id}`, {
    outputSchema: EmptyResponseSchema,
  });
}

export function useStartSession(id: string) {
  return usePost(`/sessions/${id}/start`, {
    outputSchema: SessionSchema,
  });
}

export function usePauseSession(id: string) {
  return usePost(`/sessions/${id}/pause`, {
    outputSchema: SessionSchema,
  });
}

export function useResumeSession(id: string) {
  return usePost(`/sessions/${id}/resume`, {
    outputSchema: SessionSchema,
  });
}

export function useStopSession(id: string) {
  return usePost(`/sessions/${id}/stop`, {
    outputSchema: SessionSchema,
  });
}

export function useArchiveSession(id: string) {
  return usePost(`/sessions/${id}/archive`, {
    outputSchema: SessionSchema,
  });
}
