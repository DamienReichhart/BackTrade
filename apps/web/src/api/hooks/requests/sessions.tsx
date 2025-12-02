import { useGet, usePost, usePatch, useDelete } from "..";
import {
  SessionSchema,
  SessionListResponseSchema,
  CreateSessionRequestSchema,
  UpdateSessionRequestSchema,
  SessionInfoResponseSchema,
  type DateRangeQuery,
  type SearchQuery,
} from "@backtrade/types";

/**
 * Session Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useSessions(query?: DateRangeQuery | SearchQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/sessions?${searchParams.toString()}` : "/sessions";

  return useGet(url, SessionListResponseSchema);
}

export function useSession(id: string) {
  return useGet(`/sessions/${id}`, SessionSchema, { enabled: !!id });
}

export function useCreateSession() {
  return usePost("/sessions", CreateSessionRequestSchema, SessionSchema);
}

export function useUpdateSession(id: string) {
  return usePatch(`/sessions/${id}`, UpdateSessionRequestSchema, SessionSchema);
}

export function useDeleteSession(id: string) {
  return useDelete(`/sessions/${id}`);
}

export function useArchiveSession(id: string) {
  return usePatch(`/sessions/${id}`, UpdateSessionRequestSchema, SessionSchema);
}

export function useSessionInfo(id: string) {
  return useGet(`/sessions/${id}/info`, SessionInfoResponseSchema, {
    enabled: !!id,
  });
}
