import { usePost, usePatch } from "..";
import { z } from "zod";
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  ChangePasswordRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  RefreshTokenRequestSchema,
  AuthResponseSchema,
  EmptyResponseSchema,
} from "@backtrade/types";

/**
 * Authentication API Hooks
 * Schemas are defined once and automatically applied
 */

export function useLogin() {
  return usePost("/auth/login", LoginRequestSchema, AuthResponseSchema);
}

export function useRegister() {
  return usePost("/auth/register", RegisterRequestSchema, AuthResponseSchema);
}

export function useLogout() {
  return usePost("/auth/logout", z.object({}), EmptyResponseSchema);
}

export function useRefreshToken() {
  return usePost("/auth/refresh", RefreshTokenRequestSchema, AuthResponseSchema);
}

export function useChangePassword(id: string) {
  return usePatch(`/users/${id}/password`, ChangePasswordRequestSchema, EmptyResponseSchema);
}

export function useForgotPassword() {
  return usePost("/auth/users/requester/password", ForgotPasswordRequestSchema, EmptyResponseSchema);
}

export function useResetPassword() {
  return usePost("/auth/users/resetter/password", ResetPasswordRequestSchema, EmptyResponseSchema);
}
