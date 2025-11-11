import { useGet } from "..";
import { AuditLogSchema, type DateRangeQuery } from "@backtrade/types";
import { z } from "zod";

/**
 * Audit Log Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useAuditLogs(query?: DateRangeQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/audit/logs?${searchParams.toString()}` : "/audit/logs";

  return useGet(url, {
    outputSchema: z.array(AuditLogSchema),
  });
}

export function useAuditLog(id: string) {
  return useGet(`/audit/logs/${id}`, {
    outputSchema: AuditLogSchema,
  });
}

export function useAuditLogsByUser(userId: string, query?: DateRangeQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/users/${userId}/audit-logs?${searchParams.toString()}`
    : `/users/${userId}/audit-logs`;

  return useGet(url, {
    outputSchema: z.array(AuditLogSchema),
  });
}

export function useAuditLogsByEntity(
  entityType: string,
  entityId: string,
  query?: DateRangeQuery,
) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/audit/entities/${entityType}/${entityId}?${searchParams.toString()}`
    : `/audit/entities/${entityType}/${entityId}`;

  return useGet(url, {
    outputSchema: z.array(AuditLogSchema),
  });
}
