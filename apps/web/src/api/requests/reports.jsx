import { useGet, usePost, usePut, useDelete } from "../hooks/index.jsx";

// Report Management Hooks
export function useReports(query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/reports?${searchParams.toString()}` : "/reports";

  return useGet(url);
}

export function useReport(id) {
  return useGet(`/reports/${id}`);
}

export function useReportsBySession(sessionId, query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/sessions/${sessionId}/reports?${searchParams.toString()}`
    : `/sessions/${sessionId}/reports`;

  return useGet(url);
}

export function useCreateReport() {
  return usePost("/reports");
}

export function useUpdateReport(id) {
  return usePut(`/reports/${id}`);
}

export function useDeleteReport(id) {
  return useDelete(`/reports/${id}`);
}

export function useGenerateReport(sessionId) {
  return usePost(`/sessions/${sessionId}/generate-report`);
}
