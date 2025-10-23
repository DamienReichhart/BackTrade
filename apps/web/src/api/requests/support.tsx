import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  SupportRequestSchema,
  SupportRequestListResponseSchema,
  CreateSupportRequestSchema,
  SupportMessageSchema,
  CreateSupportMessageSchema,
  type DateRangeQuery,
} from "@backtrade/types";
import { z } from "zod";

/**
 * Support Request Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useSupportRequests(query?: DateRangeQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/support/requests?${searchParams.toString()}`
    : "/support/requests";

  return useGet(url, {
    outputSchema: SupportRequestListResponseSchema,
  });
}

export function useSupportRequest(id: string) {
  return useGet(`/support/requests/${id}`, {
    outputSchema: SupportRequestSchema,
  });
}

export function useCreateSupportRequest() {
  return usePost("/support/requests", {
    inputSchema: CreateSupportRequestSchema,
    outputSchema: SupportRequestSchema,
  });
}

export function useUpdateSupportRequest(id: string) {
  return usePut(`/support/requests/${id}`, {
    outputSchema: SupportRequestSchema,
  });
}

export function useDeleteSupportRequest(id: string) {
  return useDelete(`/support/requests/${id}`, {
    outputSchema: z.void(),
  });
}

export function useCloseSupportRequest(id: string) {
  return usePost(`/support/requests/${id}/close`, {
    outputSchema: SupportRequestSchema,
  });
}

// Support Message Management Hooks
export function useSupportMessages(requestId: string, query?: DateRangeQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/support/requests/${requestId}/messages?${searchParams.toString()}`
    : `/support/requests/${requestId}/messages`;

  return useGet(url, {
    outputSchema: z.array(SupportMessageSchema),
  });
}

export function useSupportMessage(id: string) {
  return useGet(`/support/messages/${id}`, {
    outputSchema: SupportMessageSchema,
  });
}

export function useCreateSupportMessage() {
  return usePost("/support/messages", {
    inputSchema: CreateSupportMessageSchema,
    outputSchema: SupportMessageSchema,
  });
}

export function useUpdateSupportMessage(id: string) {
  return usePut(`/support/messages/${id}`, {
    outputSchema: SupportMessageSchema,
  });
}

export function useDeleteSupportMessage(id: string) {
  return useDelete(`/support/messages/${id}`, {
    outputSchema: z.void(),
  });
}
