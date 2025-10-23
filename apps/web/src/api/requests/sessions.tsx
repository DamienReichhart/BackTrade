import { useGet, usePost, usePut, useDelete } from '../hooks';
import {
  SessionSchema,
  SessionListResponseSchema,
  CreateSessionRequestSchema,
  UpdateSessionRequestSchema,
  type DateRangeQuery,
} from '@backtrade/types';
import { z } from 'zod';

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

  const url = query ? `/sessions?${searchParams.toString()}` : '/sessions';

  return useGet(url, {
    outputSchema: SessionListResponseSchema,
  });
}

export function useSession(id: string) {
  return useGet(`/sessions/${id}`, {
    outputSchema: SessionSchema,
  });
}

export function useCreateSession() {
  return usePost('/sessions', {
    inputSchema: CreateSessionRequestSchema,
    outputSchema: SessionSchema,
  });
}

export function useUpdateSession(id: string) {
  return usePut(`/sessions/${id}`, {
    inputSchema: UpdateSessionRequestSchema,
    outputSchema: SessionSchema,
  });
}

export function useDeleteSession(id: string) {
  return useDelete(`/sessions/${id}`, {
    outputSchema: z.void(),
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
