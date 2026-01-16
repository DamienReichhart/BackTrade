import { z } from "zod";
import {
    LoginRequestSchema,
    RegisterRequestSchema,
    ForgotPasswordRequestSchema,
    ResetPasswordRequestSchema,
    ChangePasswordRequestSchema,
} from "@backtrade/types";

/**
 * Login form schema with client-side only fields
 */
export const LoginFormSchema = LoginRequestSchema.extend({
    rememberDevice: z.boolean().optional(),
});

export type LoginFormState = z.infer<typeof LoginFormSchema>;

/**
 * Register form schema with client-side only fields
 */
export const RegisterFormSchema = RegisterRequestSchema.extend({
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms.",
    }),
});

export type RegisterFormState = z.infer<typeof RegisterFormSchema>;

/**
 * Forgot Password form schema (Step 1)
 */
export const ForgotPasswordFormSchema = ForgotPasswordRequestSchema;

export type ForgotPasswordFormState = z.infer<typeof ForgotPasswordFormSchema>;

/**
 * Reset Password form schema (Step 2)
 */
export const ResetPasswordFormSchema = ResetPasswordRequestSchema;

export type ResetPasswordFormState = z.infer<typeof ResetPasswordFormSchema>;

/**
 * Change Password form schema with confirmation
 */
export const ChangePasswordFormSchema = ChangePasswordRequestSchema.extend({
    confirmPassword: z
        .string()
        .min(8, "Password confirmation must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type ChangePasswordFormState = z.infer<typeof ChangePasswordFormSchema>;
