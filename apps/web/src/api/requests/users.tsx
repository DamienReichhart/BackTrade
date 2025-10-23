import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  PublicUserSchema,
  UserListResponseSchema,
  UpdateUserRequestSchema,
  type SearchQuery,
} from "@backtrade/types";
import { z } from "zod";

/**
 * User Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useUsers(query?: SearchQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/users?${searchParams.toString()}` : "/users";

  return useGet(url, {
    outputSchema: UserListResponseSchema,
  });
}

export function useUser(id: string) {
  return useGet(`/users/${id}`, {
    outputSchema: PublicUserSchema,
  });
}

export function useCreateUser() {
  return usePost("/users", {
    inputSchema: UpdateUserRequestSchema,
    outputSchema: PublicUserSchema,
  });
}

export function useUpdateUser(id: string) {
  return usePut(`/users/${id}`, {
    inputSchema: UpdateUserRequestSchema,
    outputSchema: PublicUserSchema,
  });
}

export function useDeleteUser(id: string) {
  return useDelete(`/users/${id}`, {
    outputSchema: z.void(),
  });
}

export function useBanUser(id: string) {
  return usePost(`/users/${id}/ban`, {
    outputSchema: z.void(),
  });
}

export function useUnbanUser(id: string) {
  return usePost(`/users/${id}/unban`, {
    outputSchema: z.void(),
  });
}
