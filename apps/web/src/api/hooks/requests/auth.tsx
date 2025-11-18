import { usePost, useGet, usePut } from "..";
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  ChangePasswordRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  RefreshTokenRequestSchema,
  AuthResponseSchema,
  PublicUserSchema,
  EmptyResponseSchema,
} from "@backtrade/types";

/**
 * Authentication API Hooks
 * Schemas are defined once and automatically applied
 */

export function useLogin() {
  return usePost("/auth/login", {
    inputSchema: LoginRequestSchema,
    outputSchema: AuthResponseSchema,
  });
}

export function useRegister() {
  return usePost("/auth/register", {
    inputSchema: RegisterRequestSchema,
    outputSchema: AuthResponseSchema,
  });
}

export function useLogout() {
  return usePost("/auth/logout", {
    outputSchema: EmptyResponseSchema,
  });
}

export function useRefreshToken() {
  return usePost("/auth/refresh", {
    inputSchema: RefreshTokenRequestSchema,
    outputSchema: AuthResponseSchema,
  });
}

export function useChangePassword(id: string) {
  return usePut(`/users/${id}/password`, {
    inputSchema: ChangePasswordRequestSchema,
    outputSchema: EmptyResponseSchema,
  });
}

export function useForgotPassword() {
  return usePost("/auth/forgot-password", {
    inputSchema: ForgotPasswordRequestSchema,
    outputSchema: EmptyResponseSchema,
  });
}

export function useResetPassword() {
  return usePost("/auth/reset-password", {
    inputSchema: ResetPasswordRequestSchema,
    outputSchema: EmptyResponseSchema,
  });
}

export function useMe() {
  return useGet("/auth/me", {
    outputSchema: PublicUserSchema,
  });
}
