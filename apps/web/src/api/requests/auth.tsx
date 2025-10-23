import { usePost, useGet } from "../hooks";
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  ChangePasswordRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  AuthResponseSchema,
  PublicUserSchema,
} from "@backtrade/types";
import { z } from "zod";

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
    outputSchema: z.void(),
  });
}

export function useRefreshToken() {
  return usePost("/auth/refresh", {
    outputSchema: AuthResponseSchema,
  });
}

export function useChangePassword() {
  return usePost("/auth/change-password", {
    inputSchema: ChangePasswordRequestSchema,
    outputSchema: z.void(),
  });
}

export function useForgotPassword() {
  return usePost("/auth/forgot-password", {
    inputSchema: ForgotPasswordRequestSchema,
    outputSchema: z.void(),
  });
}

export function useResetPassword() {
  return usePost("/auth/reset-password", {
    inputSchema: ResetPasswordRequestSchema,
    outputSchema: z.void(),
  });
}

export function useMe() {
  return useGet("/auth/me", {
    outputSchema: PublicUserSchema,
  });
}
