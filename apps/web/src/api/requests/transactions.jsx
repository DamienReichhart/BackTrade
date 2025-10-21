import { useGet, usePost, useDelete } from "../hooks/index.jsx";

// Transaction Management Hooks
export function useTransactions(query) {
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

  return useGet(url);
}

export function useTransaction(id) {
  return useGet(`/transactions/${id}`);
}

export function useTransactionsByUser(userId, query) {
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

  return useGet(url);
}

export function useTransactionsBySession(sessionId, query) {
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

  return useGet(url);
}

export function useCreateTransaction() {
  return usePost("/transactions");
}

export function useDeleteTransaction(id) {
  return useDelete(`/transactions/${id}`);
}
