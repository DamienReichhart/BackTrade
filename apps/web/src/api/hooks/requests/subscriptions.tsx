import { useGet, usePost, usePatch, useDelete } from "../core";
import { z } from "zod";
import {
  SubscriptionSchema,
  CreateSubscriptionRequestSchema,
  UpdateSubscriptionRequestSchema,
  EmptyResponseSchema,
  type DateRangeQuery,
} from "@backtrade/types";

/**
 * Subscription Management API Hooks
 * Schemas are defined once and automatically applied
 */

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

  return useGet(url, {
    outputSchema: z.array(SubscriptionSchema),
  });
}

export function useSubscription(id: string) {
  return useGet(`/subscriptions/${id}`, {
    outputSchema: SubscriptionSchema,
  });
}

export function useSubscriptionsByUser(
  userId: string | undefined,
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

  // Use placeholder URL when userId is undefined (query will be disabled)
  const url = query
    ? `/users/${userId ?? ""}/subscriptions?${searchParams.toString()}`
    : `/users/${userId ?? ""}/subscriptions`;

  return useGet(url, {
    outputSchema: z.array(SubscriptionSchema),
    queryOptions: {
      enabled: !!userId && userId.length > 0,
    },
  });
}

export function useCreateSubscription() {
  return usePost("/subscriptions", {
    inputSchema: CreateSubscriptionRequestSchema,
    outputSchema: SubscriptionSchema,
  });
}

export function useUpdateSubscription(id: string) {
  return usePatch(`/subscriptions/${id}`, {
    inputSchema: UpdateSubscriptionRequestSchema,
    outputSchema: SubscriptionSchema,
  });
}

export function useDeleteSubscription(id: string) {
  return useDelete(`/subscriptions/${id}`, {
    outputSchema: EmptyResponseSchema,
  });
}

export function useCancelSubscription(id: string) {
  return usePost(`/subscriptions/${id}/cancel`, {
    outputSchema: SubscriptionSchema,
  });
}

export function useReactivateSubscription(id: string) {
  return usePost(`/subscriptions/${id}/reactivate`, {
    outputSchema: SubscriptionSchema,
  });
}
