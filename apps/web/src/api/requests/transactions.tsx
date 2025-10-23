import { useGet, usePost, useDelete } from "../hooks";
import {
  TransactionSchema,
  TransactionListResponseSchema,
  CreateTransactionRequestSchema,
  type DateRangeQuery,
} from "@backtrade/types";
import { z } from "zod";

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

  return useGet(url, {
    outputSchema: TransactionListResponseSchema,
  });
}

export function useTransaction(id: string) {
  return useGet(`/transactions/${id}`, {
    outputSchema: TransactionSchema,
  });
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

  return useGet(url, {
    outputSchema: TransactionListResponseSchema,
  });
}

export function useTransactionsBySession(
  sessionId: string,
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

  const url = query
    ? `/sessions/${sessionId}/transactions?${searchParams.toString()}`
    : `/sessions/${sessionId}/transactions`;

  return useGet(url, {
    outputSchema: TransactionListResponseSchema,
  });
}

export function useCreateTransaction() {
  return usePost("/transactions", {
    inputSchema: CreateTransactionRequestSchema,
    outputSchema: TransactionSchema,
  });
}

export function useDeleteTransaction(id: string) {
  return useDelete(`/transactions/${id}`, {
    outputSchema: z.void(),
  });
}
