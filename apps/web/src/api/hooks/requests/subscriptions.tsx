import { useGet, usePost, usePatch, useDelete } from "..";
import {
    SubscriptionSchema,
    SubscriptionListResponseSchema,
    CreateSubscriptionRequestSchema,
    UpdateSubscriptionRequestSchema,
    type DateRangeQuery,
} from "@backtrade/types";
import { buildUrlWithParams } from "../utils/url-params";

/**
 * Subscription Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useSubscriptions(query?: DateRangeQuery) {
    const url = buildUrlWithParams("/subscriptions", query);
    return useGet(url, SubscriptionListResponseSchema);
}

export function useSubscription(id: string) {
    return useGet(`/subscriptions/${id}`, SubscriptionSchema, {
        enabled: !!id,
    });
}

export function useSubscriptionsByUser(
    userId: string | undefined,
    query?: DateRangeQuery
) {
    const url = buildUrlWithParams(
        `/users/${userId ?? ""}/subscriptions`,
        query
    );
    return useGet(url, SubscriptionListResponseSchema, { enabled: !!userId });
}

export function useCreateSubscription() {
    return usePost(
        "/subscriptions",
        CreateSubscriptionRequestSchema,
        SubscriptionSchema
    );
}

export function useUpdateSubscription(id: string) {
    return usePatch(
        `/subscriptions/${id}`,
        UpdateSubscriptionRequestSchema,
        SubscriptionSchema
    );
}

export function useDeleteSubscription(id: string) {
    return useDelete(`/subscriptions/${id}`);
}
