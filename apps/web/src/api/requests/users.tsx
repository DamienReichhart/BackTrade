import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  PublicUser,
  PublicUserSchema,
  UserListResponse,
  UserListResponseSchema,
  UpdateUserRequest,
  UpdateUserRequestSchema,
  PaginationQuery,
  PaginationQuerySchema,
  SearchQuery,
  SearchQuerySchema,
} from "@backtrade/types";

// User Management Hooks
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

  return useGet<UserListResponse>(url, {
    outputSchema: UserListResponseSchema,
  });
}

export function useUser(id: string) {
  return useGet<PublicUser>(`/users/${id}`, {
    outputSchema: PublicUserSchema,
  });
}

export function useCreateUser() {
  return usePost<PublicUser, UpdateUserRequest>("/users", {
    inputSchema: UpdateUserRequestSchema,
    outputSchema: PublicUserSchema,
  });
}

export function useUpdateUser(id: string) {
  return usePut<PublicUser, UpdateUserRequest>(`/users/${id}`, {
    inputSchema: UpdateUserRequestSchema,
    outputSchema: PublicUserSchema,
  });
}

export function useDeleteUser(id: string) {
  return useDelete<void>(`/users/${id}`);
}

export function useBanUser(id: string) {
  return usePost<void>(`/users/${id}/ban`);
}

export function useUnbanUser(id: string) {
  return usePost<void>(`/users/${id}/unban`);
}
