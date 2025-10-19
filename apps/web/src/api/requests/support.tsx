import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  SupportRequest,
  SupportRequestSchema,
  SupportRequestListResponse,
  SupportRequestListResponseSchema,
  CreateSupportRequest,
  CreateSupportRequestSchema,
  SupportMessage,
  SupportMessageSchema,
  CreateSupportMessage,
  CreateSupportMessageSchema,
  DateRangeQuery,
  DateRangeQuerySchema,
} from "@backtrade/types";

// Support Request Management Hooks
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

  return useGet<SupportRequestListResponse>(url, {
    outputSchema: SupportRequestListResponseSchema,
  });
}

export function useSupportRequest(id: string) {
  return useGet<SupportRequest>(`/support/requests/${id}`, {
    outputSchema: SupportRequestSchema,
  });
}

export function useCreateSupportRequest() {
  return usePost<SupportRequest, CreateSupportRequest>("/support/requests", {
    inputSchema: CreateSupportRequestSchema,
    outputSchema: SupportRequestSchema,
  });
}

export function useUpdateSupportRequest(id: string) {
  return usePut<SupportRequest, Partial<CreateSupportRequest>>(
    `/support/requests/${id}`,
    {
      outputSchema: SupportRequestSchema,
    },
  );
}

export function useDeleteSupportRequest(id: string) {
  return useDelete<void>(`/support/requests/${id}`);
}

export function useCloseSupportRequest(id: string) {
  return usePost<SupportRequest>(`/support/requests/${id}/close`, {
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

  return useGet<SupportMessage[]>(url, {
    outputSchema: SupportMessageSchema.array(),
  });
}

export function useSupportMessage(id: string) {
  return useGet<SupportMessage>(`/support/messages/${id}`, {
    outputSchema: SupportMessageSchema,
  });
}

export function useCreateSupportMessage() {
  return usePost<SupportMessage, CreateSupportMessage>("/support/messages", {
    inputSchema: CreateSupportMessageSchema,
    outputSchema: SupportMessageSchema,
  });
}

export function useUpdateSupportMessage(id: string) {
  return usePut<SupportMessage, Partial<CreateSupportMessage>>(
    `/support/messages/${id}`,
    {
      outputSchema: SupportMessageSchema,
    },
  );
}

export function useDeleteSupportMessage(id: string) {
  return useDelete<void>(`/support/messages/${id}`);
}
