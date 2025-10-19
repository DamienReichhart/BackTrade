import { z } from "zod";

// =========================
// API RESPONSE SCHEMAS
// =========================

// Generic API Response
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});
export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

// Error Response
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  error: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Success Response
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.unknown(),
});
export type SuccessResponse<T = unknown> = {
  success: true;
  message?: string;
  data: T;
};

// Validation Error
export const ValidationErrorSchema = z.object({
  success: z.literal(false),
  message: z.literal("Validation failed"),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })),
});
export type ValidationError = z.infer<typeof ValidationErrorSchema>;

// Paginated Response
export const PaginatedResponseSchema = z.object({
  data: z.array(z.unknown()),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});
export type PaginatedResponse<T = unknown> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// Bulk Operation Response
export const BulkOperationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  processed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  errors: z.array(z.object({
    id: z.string(),
    error: z.string(),
  })).optional(),
});
export type BulkOperationResponse = z.infer<typeof BulkOperationResponseSchema>;

// File Upload Response
export const FileUploadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  file: z.object({
    id: z.number().int().positive(),
    filename: z.string(),
    size: z.string(),
    url: z.string().url(),
  }),
});
export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;

// Health Check Response
export const HealthCheckResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
  version: z.string(),
  uptime: z.number().positive(),
  environment: z.string(),
});
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

// Statistics Response
export const StatisticsResponseSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  totalSessions: z.number().int().nonnegative(),
  totalPositions: z.number().int().nonnegative(),
  totalTransactions: z.number().int().nonnegative(),
  activeUsers: z.number().int().nonnegative(),
  activeSessions: z.number().int().nonnegative(),
});
export type StatisticsResponse = z.infer<typeof StatisticsResponseSchema>;
