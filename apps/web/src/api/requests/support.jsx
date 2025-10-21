import { useGet, usePost, usePut, useDelete } from "../hooks/index.jsx";

// Support Request Management Hooks
export function useSupportRequests(query) {
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

  return useGet(url);
}

export function useSupportRequest(id) {
  return useGet(`/support/requests/${id}`);
}

export function useCreateSupportRequest() {
  return usePost("/support/requests");
}

export function useUpdateSupportRequest(id) {
  return usePut(`/support/requests/${id}`);
}

export function useDeleteSupportRequest(id) {
  return useDelete(`/support/requests/${id}`);
}

export function useCloseSupportRequest(id) {
  return usePost(`/support/requests/${id}/close`);
}

// Support Message Management Hooks
export function useSupportMessages(requestId, query) {
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

  return useGet(url);
}

export function useSupportMessage(id) {
  return useGet(`/support/messages/${id}`);
}

export function useCreateSupportMessage() {
  return usePost("/support/messages");
}

export function useUpdateSupportMessage(id) {
  return usePut(`/support/messages/${id}`);
}

export function useDeleteSupportMessage(id) {
  return useDelete(`/support/messages/${id}`);
}
