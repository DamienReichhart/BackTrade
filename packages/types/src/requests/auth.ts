import { z } from "zod";
import { PublicUserSchema } from "../entities/user";

export const JwtPayloadGenerationSchema = z.object({
    sub: PublicUserSchema,
});
export type JwtPayloadGeneration = z.infer<typeof JwtPayloadGenerationSchema>;

export const JwtPayloadSchema = z.object({
    sub: PublicUserSchema,
    iat: z.number(),
    exp: z.number(),
});
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

export const LoginRequestSchema = z.object({
    email: z.string().email().transform((email) => email.toLowerCase()),
    password: z.string().min(8),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z
    .object({
        email: z.string().email().transform((email) => email.toLowerCase()),
        password: z.string().min(8),
        confirmPassword: z.string().min(8),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const ChangePasswordRequestSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
});
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

export const ForgotPasswordRequestSchema = z.object({
    email: z.string().email().transform((email) => email.toLowerCase()),
});
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ResetPasswordRequestSchema = z.object({
    code: z.string(),
    newPassword: z.string().min(8),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export const AuthResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const RefreshTokenRequestSchema = z.object({
    refreshToken: z.string().min(1),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
