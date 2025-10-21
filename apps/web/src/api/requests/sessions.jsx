import { useGet, usePost, usePut, useDelete } from "../hooks/index.jsx";

// Session Management Hooks
export function useSessions(query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/sessions?${searchParams.toString()}` : "/sessions";

  return useGet(url);
}

export function useSession(id) {
  return useGet(`/sessions/${id}`);
}

export function useCreateSession() {
  return usePost("/sessions");
}

export function useUpdateSession(id) {
  return usePut(`/sessions/${id}`);
}

export function useDeleteSession(id) {
  return useDelete(`/sessions/${id}`);
}

export function useStartSession(id) {
  return usePost(`/sessions/${id}/start`);
}

export function usePauseSession(id) {
  return usePost(`/sessions/${id}/pause`);
}

export function useResumeSession(id) {
  return usePost(`/sessions/${id}/resume`);
}

export function useStopSession(id) {
  return usePost(`/sessions/${id}/stop`);
}

export function useArchiveSession(id) {
  return usePost(`/sessions/${id}/archive`);
}
