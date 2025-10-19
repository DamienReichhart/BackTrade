import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  Report,
  ReportSchema,
  ReportListResponse,
  ReportListResponseSchema,
  CreateReportRequest,
  CreateReportRequestSchema,
  DateRangeQuery,
  DateRangeQuerySchema,
} from "@backtrade/types";

// Report Management Hooks
export function useReports(query?: DateRangeQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/reports?${searchParams.toString()}` : "/reports";

  return useGet<ReportListResponse>(url, {
    outputSchema: ReportListResponseSchema,
  });
}

export function useReport(id: string) {
  return useGet<Report>(`/reports/${id}`, {
    outputSchema: ReportSchema,
  });
}

export function useReportsBySession(sessionId: string, query?: DateRangeQuery) {
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

  return useGet<ReportListResponse>(url, {
    outputSchema: ReportListResponseSchema,
  });
}

export function useCreateReport() {
  return usePost<Report, CreateReportRequest>("/reports", {
    inputSchema: CreateReportRequestSchema,
    outputSchema: ReportSchema,
  });
}

export function useUpdateReport(id: string) {
  return usePut<Report, Partial<CreateReportRequest>>(`/reports/${id}`, {
    outputSchema: ReportSchema,
  });
}

export function useDeleteReport(id: string) {
  return useDelete<void>(`/reports/${id}`);
}

export function useGenerateReport(sessionId: string) {
  return usePost<Report>(`/sessions/${sessionId}/generate-report`, {
    outputSchema: ReportSchema,
  });
}
