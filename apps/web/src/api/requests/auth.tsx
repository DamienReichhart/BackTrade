import { usePost, useGet } from "../hooks";
import {
  LoginRequest,
  LoginRequestSchema,
  RegisterRequest,
  RegisterRequestSchema,
  ChangePasswordRequest,
  ChangePasswordRequestSchema,
  ForgotPasswordRequest,
  ForgotPasswordRequestSchema,
  ResetPasswordRequest,
  ResetPasswordRequestSchema,
  AuthResponse,
  AuthResponseSchema,
  PublicUser,
  PublicUserSchema,
} from "@backtrade/types";

// Authentication Hooks
export function useLogin() {
  return usePost<AuthResponse, LoginRequest>("/auth/login", {
    inputSchema: LoginRequestSchema,
    outputSchema: AuthResponseSchema,
  });
}

export function useRegister() {
  return usePost<AuthResponse, RegisterRequest>("/auth/register", {
    inputSchema: RegisterRequestSchema,
    outputSchema: AuthResponseSchema,
  });
}

export function useLogout() {
  return usePost<void>("/auth/logout");
}

export function useRefreshToken() {
  return usePost<AuthResponse>("/auth/refresh");
}

export function useChangePassword() {
  return usePost<void, ChangePasswordRequest>("/auth/change-password", {
    inputSchema: ChangePasswordRequestSchema,
  });
}

export function useForgotPassword() {
  return usePost<void, ForgotPasswordRequest>("/auth/forgot-password", {
    inputSchema: ForgotPasswordRequestSchema,
  });
}

export function useResetPassword() {
  return usePost<void, ResetPasswordRequest>("/auth/reset-password", {
    inputSchema: ResetPasswordRequestSchema,
  });
}

export function useMe() {
  return useGet<PublicUser>("/auth/me", {
    outputSchema: PublicUserSchema,
  });
}
