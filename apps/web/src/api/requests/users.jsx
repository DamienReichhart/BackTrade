import { useGet, usePost, usePut, useDelete } from "../hooks/index.jsx";

// User Management Hooks
export function useUsers(query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/users?${searchParams.toString()}` : "/users";

  return useGet(url);
}

export function useUser(id) {
  return useGet(`/users/${id}`);
}

export function useCreateUser() {
  return usePost("/users");
}

export function useUpdateUser(id) {
  return usePut(`/users/${id}`);
}

export function useDeleteUser(id) {
  return useDelete(`/users/${id}`);
}

export function useBanUser(id) {
  return usePost(`/users/${id}/ban`);
}

export function useUnbanUser(id) {
  return usePost(`/users/${id}/unban`);
}
