import { z } from "zod";
import {
  UserSchema,
  PublicUserSchema,
  UserPasswordChangeCodeSchema,
  UserSessionSchema,
  PlanSchema,
  SubscriptionSchema,
  StripeEventSchema,
  AuditLogSchema,
  InstrumentSchema,
  DatasetSchema,
  CandleSchema,
  SessionSchema,
  PositionSchema,
  TransactionSchema,
  ReportSchema,
  SupportRequestSchema,
  SupportMessageSchema,
  FileSchema,
  ReportFileSchema,
  SupportMessageFileSchema,
} from "./entities";
import {
  RoleSchema,
  SessionStatusSchema,
  PositionStatusSchema,
  TimeframeSchema,
  SideSchema,
  SpeedSchema,
  SupportStatusSchema,
  TransactionTypeSchema,
  EntityTypeSchema,
  AuditActionSchema,
  SubscriptionStatusSchema,
} from "./enums";

// =========================
// REQUEST/RESPONSE SCHEMAS
// =========================

// Authentication
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const ChangePasswordRequestSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ResetPasswordRequestSchema = z
  .object({
    code: z.string(),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export const AuthResponseSchema = z.object({
  user: PublicUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// User Management
export const UpdateUserRequestSchema = z.object({
  email: z.string().email().optional(),
  role: RoleSchema.optional(),
  is_banned: z.boolean().optional(),
});
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

export const UserListResponseSchema = z.object({
  users: z.array(PublicUserSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type UserListResponse = z.infer<typeof UserListResponseSchema>;

// Session Management
export const CreateSessionRequestSchema = z.object({
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
  speed: SpeedSchema,
  start_ts: z.iso.datetime(),
  end_ts: z.iso.datetime().optional(),
  initial_balance: z.number().positive(),
  leverage: z.number().positive(),
  spread_pts: z.number().int().nonnegative(),
  slippage_pts: z.number().int().nonnegative(),
  commission_per_fill: z.number().nonnegative(),
});
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const UpdateSessionRequestSchema = z.object({
  session_status: SessionStatusSchema.optional(),
  speed: SpeedSchema.optional(),
  end_ts: z.iso.datetime().optional(),
});
export type UpdateSessionRequest = z.infer<typeof UpdateSessionRequestSchema>;

export const SessionListResponseSchema = z.object({
  sessions: z.array(SessionSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type SessionListResponse = z.infer<typeof SessionListResponseSchema>;

// Position Management
export const CreatePositionRequestSchema = z.object({
  session_id: z.number().int().positive(),
  candle_id: z.number().int().positive(),
  side: SideSchema,
  entry_price: z.number().positive(),
  quantity_lots: z.number().positive(),
  tp_price: z.number().positive().optional(),
  sl_price: z.number().positive().optional(),
});
export type CreatePositionRequest = z.infer<typeof CreatePositionRequestSchema>;

export const UpdatePositionRequestSchema = z.object({
  position_status: PositionStatusSchema.optional(),
  exit_candle_id: z.number().int().positive().optional(),
  exit_price: z.number().positive().optional(),
  closed_at: z.iso.datetime().optional(),
  realized_pnl: z.number().optional(),
  commission_cost: z.number().nonnegative().optional(),
  slippage_cost: z.number().nonnegative().optional(),
  spread_cost: z.number().nonnegative().optional(),
});
export type UpdatePositionRequest = z.infer<typeof UpdatePositionRequestSchema>;

export const PositionListResponseSchema = z.object({
  positions: z.array(PositionSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type PositionListResponse = z.infer<typeof PositionListResponseSchema>;

// Transaction Management
export const CreateTransactionRequestSchema = z.object({
  user_id: z.number().int().positive(),
  session_id: z.number().int().positive().optional(),
  position_id: z.number().int().positive().optional(),
  transaction_type: TransactionTypeSchema,
  amount: z.number(),
  balance_after: z.number(),
});
export type CreateTransactionRequest = z.infer<
  typeof CreateTransactionRequestSchema
>;

export const TransactionListResponseSchema = z.object({
  transactions: z.array(TransactionSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type TransactionListResponse = z.infer<
  typeof TransactionListResponseSchema
>;

// Instrument Management
export const CreateInstrumentRequestSchema = z.object({
  symbol: z.string(),
  display_name: z.string(),
  pip_size: z.number().positive(),
  enabled: z.boolean().default(true),
});
export type CreateInstrumentRequest = z.infer<
  typeof CreateInstrumentRequestSchema
>;

export const UpdateInstrumentRequestSchema = z.object({
  display_name: z.string().optional(),
  pip_size: z.number().positive().optional(),
  enabled: z.boolean().optional(),
});
export type UpdateInstrumentRequest = z.infer<
  typeof UpdateInstrumentRequestSchema
>;

export const InstrumentListResponseSchema = z.object({
  instruments: z.array(InstrumentSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type InstrumentListResponse = z.infer<
  typeof InstrumentListResponseSchema
>;

// Dataset Management
export const CreateDatasetRequestSchema = z.object({
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
  file_id: z.number().int().positive(),
  start_ts: z.iso.datetime(),
  end_ts: z.iso.datetime(),
});
export type CreateDatasetRequest = z.infer<typeof CreateDatasetRequestSchema>;

export const DatasetListResponseSchema = z.object({
  datasets: z.array(DatasetSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type DatasetListResponse = z.infer<typeof DatasetListResponseSchema>;

// Candle Management
export const CreateCandleRequestSchema = z.object({
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
  ts: z.iso.datetime(),
  open: z.number().positive(),
  high: z.number().positive(),
  low: z.number().positive(),
  close: z.number().positive(),
  volume: z.number().nonnegative(),
});
export type CreateCandleRequest = z.infer<typeof CreateCandleRequestSchema>;

export const CandleListResponseSchema = z.object({
  candles: z.array(CandleSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type CandleListResponse = z.infer<typeof CandleListResponseSchema>;

// Report Management
export const CreateReportRequestSchema = z.object({
  session_id: z.number().int().positive(),
  summary_json: z.record(z.string(), z.unknown()),
  equity_curve_json: z.record(z.string(), z.unknown()),
});
export type CreateReportRequest = z.infer<typeof CreateReportRequestSchema>;

export const ReportListResponseSchema = z.object({
  reports: z.array(ReportSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type ReportListResponse = z.infer<typeof ReportListResponseSchema>;

// Support Management
export const CreateSupportRequestSchema = z.object({
  requester_id: z.number().int().positive(),
  support_status: SupportStatusSchema.default("OPEN"),
});
export type CreateSupportRequest = z.infer<typeof CreateSupportRequestSchema>;

export const CreateSupportMessageSchema = z.object({
  sender_id: z.number().int().positive(),
  support_request_id: z.number().int().positive(),
  content: z.string().min(1),
});
export type CreateSupportMessage = z.infer<typeof CreateSupportMessageSchema>;

export const SupportRequestListResponseSchema = z.object({
  support_requests: z.array(SupportRequestSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type SupportRequestListResponse = z.infer<
  typeof SupportRequestListResponseSchema
>;

// File Management
export const CreateFileRequestSchema = z.object({
  owner_id: z.number().int().positive(),
  entity_id: z.string(),
  path: z.string(),
  size: z.string(),
  md5: z.string(),
});
export type CreateFileRequest = z.infer<typeof CreateFileRequestSchema>;

export const FileListResponseSchema = z.object({
  files: z.array(FileSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type FileListResponse = z.infer<typeof FileListResponseSchema>;

// Pagination
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// Search
export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  ...PaginationQuerySchema.shape,
});
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// Date Range
export const DateRangeQuerySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  ...PaginationQuerySchema.shape,
});
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;
