import { useGet, usePost } from "..";
import {
  TransactionSchema,
  TransactionListResponseSchema,
  CreateTransactionRequestSchema,
  type DateRangeQuery,
  type PaginationQuery,
} from "@backtrade/types";

/**
 * Transaction Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useTransactions(query?: DateRangeQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/transactions?${searchParams.toString()}`
    : "/transactions";

  return useGet(url, TransactionListResponseSchema);
}

export function useTransaction(id: string) {
  return useGet(`/transactions/${id}`, TransactionSchema, { enabled: !!id });
}

export function useTransactionsByUser(userId: string, query?: DateRangeQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/users/${userId}/transactions?${searchParams.toString()}`
    : `/users/${userId}/transactions`;

  return useGet(url, TransactionListResponseSchema, { enabled: !!userId });
}

export function useTransactionsBySession(sessionId: string, query?: PaginationQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query
    ? `/sessions/${sessionId}/transactions?${searchParams.toString()}`
    : `/sessions/${sessionId}/transactions`;

  return useGet(url, TransactionListResponseSchema, { enabled: !!sessionId });
}

export function useCreateTransaction() {
  return usePost("/transactions", CreateTransactionRequestSchema, TransactionSchema);
}
