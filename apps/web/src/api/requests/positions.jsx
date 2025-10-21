import { useGet, usePost, usePut, useDelete } from "../hooks/index.jsx";

// Position Management Hooks
export function usePositions(query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/positions?${searchParams.toString()}` : "/positions";

  return useGet(url);
}

export function usePosition(id) {
  return useGet(`/positions/${id}`);
}

export function usePositionsBySession(sessionId, query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/sessions/${sessionId}/positions?${searchParams.toString()}`
    : `/sessions/${sessionId}/positions`;

  return useGet(url);
}

export function useCreatePosition() {
  return usePost("/positions");
}

export function useUpdatePosition(id) {
  return usePut(`/positions/${id}`);
}

export function useDeletePosition(id) {
  return useDelete(`/positions/${id}`);
}

export function useClosePosition(id) {
  return usePost(`/positions/${id}/close`);
}

export function useLiquidatePosition(id) {
  return usePost(`/positions/${id}/liquidate`);
}
