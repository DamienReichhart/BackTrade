import { useGet, usePost, usePut, useDelete } from "..";
import {
  ReportSchema,
  ReportListResponseSchema,
  CreateReportRequestSchema,
  UpdateReportRequestSchema,
  GenerateReportRequestSchema,
  EmptyResponseSchema,
  type DateRangeQuery,
} from "@backtrade/types";

/**
 * Report Management API Hooks
 * Schemas are defined once and automatically applied
 */

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

  return useGet(url, {
    outputSchema: ReportListResponseSchema,
  });
}

export function useReport(id: string) {
  return useGet(`/reports/${id}`, {
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

  return useGet(url, {
    outputSchema: ReportListResponseSchema,
  });
}

export function useCreateReport() {
  return usePost("/reports", {
    inputSchema: CreateReportRequestSchema,
    outputSchema: ReportSchema,
  });
}

export function useUpdateReport(id: string) {
  return usePut(`/reports/${id}`, {
    inputSchema: UpdateReportRequestSchema,
    outputSchema: ReportSchema,
  });
}

export function useDeleteReport(id: string) {
  return useDelete(`/reports/${id}`, {
    outputSchema: EmptyResponseSchema,
  });
}

export function useGenerateReport(sessionId: string) {
  return usePost(`/sessions/${sessionId}/generate-report`, {
    inputSchema: GenerateReportRequestSchema,
    outputSchema: ReportSchema,
  });
}
