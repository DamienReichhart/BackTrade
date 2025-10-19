import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  Session,
  SessionSchema,
  SessionListResponse,
  SessionListResponseSchema,
  CreateSessionRequest,
  CreateSessionRequestSchema,
  UpdateSessionRequest,
  UpdateSessionRequestSchema,
  DateRangeQuery,
  DateRangeQuerySchema,
} from "@backtrade/types";

// Session Management Hooks
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
  
  return useGet<SessionListResponse>(url, {
    outputSchema: SessionListResponseSchema,
  });
}

export function useSession(id: string) {
  return useGet<Session>(`/sessions/${id}`, {
    outputSchema: SessionSchema,
  });
}

export function useCreateSession() {
  return usePost<Session, CreateSessionRequest>("/sessions", {
    inputSchema: CreateSessionRequestSchema,
    outputSchema: SessionSchema,
  });
}

export function useUpdateSession(id: string) {
  return usePut<Session, UpdateSessionRequest>(`/sessions/${id}`, {
    inputSchema: UpdateSessionRequestSchema,
    outputSchema: SessionSchema,
  });
}

export function useDeleteSession(id: string) {
  return useDelete<void>(`/sessions/${id}`);
}

export function useStartSession(id: string) {
  return usePost<Session>(`/sessions/${id}/start`, {
    outputSchema: SessionSchema,
  });
}

export function usePauseSession(id: string) {
  return usePost<Session>(`/sessions/${id}/pause`, {
    outputSchema: SessionSchema,
  });
}

export function useResumeSession(id: string) {
  return usePost<Session>(`/sessions/${id}/resume`, {
    outputSchema: SessionSchema,
  });
}

export function useStopSession(id: string) {
  return usePost<Session>(`/sessions/${id}/stop`, {
    outputSchema: SessionSchema,
  });
}

export function useArchiveSession(id: string) {
  return usePost<Session>(`/sessions/${id}/archive`, {
    outputSchema: SessionSchema,
  });
}
