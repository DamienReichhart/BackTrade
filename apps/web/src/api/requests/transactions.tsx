import { useGet, usePost, useDelete } from "../hooks";
import {
  type Transaction,
  TransactionSchema,
  type TransactionListResponse,
  TransactionListResponseSchema,
  type CreateTransactionRequest,
  CreateTransactionRequestSchema,
  type DateRangeQuery,
} from "@backtrade/types";

// Transaction Management Hooks
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

  return useGet<TransactionListResponse>(url, {
    outputSchema: TransactionListResponseSchema,
  });
}

export function useTransaction(id: string) {
  return useGet<Transaction>(`/transactions/${id}`, {
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

  return useGet<TransactionListResponse>(url, {
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

  return useGet<TransactionListResponse>(url, {
    outputSchema: TransactionListResponseSchema,
  });
}

export function useCreateTransaction() {
  return usePost<Transaction, CreateTransactionRequest>("/transactions", {
    inputSchema: CreateTransactionRequestSchema,
    outputSchema: TransactionSchema,
  });
}

export function useDeleteTransaction(id: string) {
  return useDelete<void>(`/transactions/${id}`);
}
