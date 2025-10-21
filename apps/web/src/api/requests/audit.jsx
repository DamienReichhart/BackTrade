import { useGet } from "../hooks/index.jsx";

// Audit Log Management Hooks
export function useAuditLogs(query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/audit/logs?${searchParams.toString()}` : "/audit/logs";

  return useGet(url);
}

export function useAuditLog(id) {
  return useGet(`/audit/logs/${id}`);
}

export function useAuditLogsByUser(userId, query) {
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

  return useGet(url);
}

export function useAuditLogsByEntity(entityType, entityId, query) {
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

  return useGet(url);
}
