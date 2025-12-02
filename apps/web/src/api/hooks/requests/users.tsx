import { useGet, usePost, usePatch, useDelete } from "..";
import {
    PublicUserSchema,
    UserListResponseSchema,
    UpdateUserRequestSchema,
    type SearchQueryUser,
} from "@backtrade/types";

/**
 * User Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useUsers(query?: SearchQueryUser) {
    const searchParams = new URLSearchParams();
    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        });
    }

    const url = query ? `/users?${searchParams.toString()}` : "/users";

    return useGet(url, UserListResponseSchema);
}

export function useUser(id: string) {
    return useGet(`/users/${id}`, PublicUserSchema, { enabled: !!id });
}

export function useCreateUser() {
    return usePost("/users", UpdateUserRequestSchema, PublicUserSchema);
}

export function useUpdateUser(id: string) {
    return usePatch(`/users/${id}`, UpdateUserRequestSchema, PublicUserSchema);
}

export function useDeleteUser(id: string) {
    return useDelete(`/users/${id}`);
}
