import { usePost, useGet } from "../hooks/index.jsx";

// Authentication Hooks
export function useLogin() {
  return usePost("/auth/login");
}

export function useRegister() {
  return usePost("/auth/register");
}

export function useLogout() {
  return usePost("/auth/logout");
}

export function useRefreshToken() {
  return usePost("/auth/refresh");
}

export function useChangePassword() {
  return usePost("/auth/change-password");
}

export function useForgotPassword() {
  return usePost("/auth/forgot-password");
}

export function useResetPassword() {
  return usePost("/auth/reset-password");
}

export function useMe() {
  return useGet("/auth/me");
}
