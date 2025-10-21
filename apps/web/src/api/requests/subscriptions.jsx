import { useGet, usePost, usePut, useDelete } from "../hooks/index.jsx";

// Subscription Management Hooks
export function useSubscriptions(query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/subscriptions?${searchParams.toString()}`
    : "/subscriptions";

  return useGet(url);
}

export function useSubscription(id) {
  return useGet(`/subscriptions/${id}`);
}

export function useSubscriptionsByUser(userId, query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/users/${userId}/subscriptions?${searchParams.toString()}`
    : `/users/${userId}/subscriptions`;

  return useGet(url);
}

export function useCreateSubscription() {
  return usePost("/subscriptions");
}

export function useUpdateSubscription(id) {
  return usePut(`/subscriptions/${id}`);
}

export function useDeleteSubscription(id) {
  return useDelete(`/subscriptions/${id}`);
}

export function useCancelSubscription(id) {
  return usePost(`/subscriptions/${id}/cancel`);
}

export function useReactivateSubscription(id) {
  return usePost(`/subscriptions/${id}/reactivate`);
}
