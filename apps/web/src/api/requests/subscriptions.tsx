import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  Subscription,
  SubscriptionSchema,
  DateRangeQuery,
  DateRangeQuerySchema,
} from "@backtrade/types";

// Subscription Management Hooks
export function useSubscriptions(query?: DateRangeQuery) {
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

  return useGet<Subscription[]>(url, {
    outputSchema: SubscriptionSchema.array(),
  });
}

export function useSubscription(id: string) {
  return useGet<Subscription>(`/subscriptions/${id}`, {
    outputSchema: SubscriptionSchema,
  });
}

export function useSubscriptionsByUser(userId: string, query?: DateRangeQuery) {
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

  return useGet<Subscription[]>(url, {
    outputSchema: SubscriptionSchema.array(),
  });
}

export function useCreateSubscription() {
  return usePost<Subscription, Omit<Subscription, "id">>("/subscriptions", {
    outputSchema: SubscriptionSchema,
  });
}

export function useUpdateSubscription(id: string) {
  return usePut<Subscription, Partial<Omit<Subscription, "id">>>(
    `/subscriptions/${id}`,
    {
      outputSchema: SubscriptionSchema,
    },
  );
}

export function useDeleteSubscription(id: string) {
  return useDelete<void>(`/subscriptions/${id}`);
}

export function useCancelSubscription(id: string) {
  return usePost<Subscription>(`/subscriptions/${id}/cancel`, {
    outputSchema: SubscriptionSchema,
  });
}

export function useReactivateSubscription(id: string) {
  return usePost<Subscription>(`/subscriptions/${id}/reactivate`, {
    outputSchema: SubscriptionSchema,
  });
}
