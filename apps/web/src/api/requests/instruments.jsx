import { useGet, usePost, usePut, useDelete } from "../hooks/index.jsx";

// Instrument Management Hooks
export function useInstruments(query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/instruments?${searchParams.toString()}`
    : "/instruments";

  return useGet(url);
}

export function useInstrument(id) {
  return useGet(`/instruments/${id}`);
}

export function useCreateInstrument() {
  return usePost("/instruments");
}

export function useUpdateInstrument(id) {
  return usePut(`/instruments/${id}`);
}

export function useDeleteInstrument(id) {
  return useDelete(`/instruments/${id}`);
}

export function useEnableInstrument(id) {
  return usePost(`/instruments/${id}/enable`);
}

export function useDisableInstrument(id) {
  return usePost(`/instruments/${id}/disable`);
}
