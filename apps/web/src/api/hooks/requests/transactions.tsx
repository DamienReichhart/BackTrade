import { useGet, usePost } from "..";
import {
    TransactionSchema,
    TransactionListResponseSchema,
    CreateTransactionRequestSchema,
    type DateRangeQuery,
    type SearchQuery,
} from "@backtrade/types";
import { buildUrlWithParams } from "../utils/url-params";

/**
 * Transaction Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useTransactions(query?: DateRangeQuery) {
    const url = buildUrlWithParams("/transactions", query);
    return useGet(url, TransactionListResponseSchema);
}

export function useTransaction(id: string) {
    return useGet(`/transactions/${id}`, TransactionSchema, { enabled: !!id });
}

export function useTransactionsByUser(userId: string, query?: DateRangeQuery) {
    const url = buildUrlWithParams(`/users/${userId}/transactions`, query);
    return useGet(url, TransactionListResponseSchema, { enabled: !!userId });
}

export function useTransactionsBySession(
    sessionId: string,
    query?: SearchQuery
) {
    const url = buildUrlWithParams(
        `/sessions/${sessionId}/transactions`,
        query
    );
    return useGet(url, TransactionListResponseSchema, { enabled: !!sessionId });
}

export function useCreateTransaction() {
    return usePost(
        "/transactions",
        CreateTransactionRequestSchema,
        TransactionSchema
    );
}
