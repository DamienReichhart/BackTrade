import { z } from "zod";
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
// CORE ENTITIES
// =========================

// User Entity
export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  password_hash: z.string(),
  mfa_secret: z.string().optional(),
  role: RoleSchema,
  is_banned: z.boolean().default(false),
  stripe_customer_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type User = z.infer<typeof UserSchema>;

// Public User Schema (without sensitive data)
export const PublicUserSchema = UserSchema.omit({
  password_hash: true,
  mfa_secret: true,
});
export type PublicUser = z.infer<typeof PublicUserSchema>;

// User Password Change Code
export const UserPasswordChangeCodeSchema = z.object({
  code: z.string(),
  user_id: z.number().int().positive(),
  created_at: z.string(),
});
export type UserPasswordChangeCode = z.infer<
  typeof UserPasswordChangeCodeSchema
>;

// User Session
export const UserSessionSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  ip_address: z.string(),
  user_agent: z.string(),
  device_info: z.string(),
  refresh_token_hash: z.string(),
  issued_at: z.iso.datetime(),
  last_seen: z.iso.datetime(),
  expires_at: z.iso.datetime(),
  is_active: z.boolean().default(true),
});
export type UserSession = z.infer<typeof UserSessionSchema>;

// Plan
export const PlanSchema = z.object({
  id: z.number().int().positive(),
  code: z.string(),
  stripe_product_id: z.string(),
  stripe_price_id: z.string(),
  currency: z.string().length(3),
});
export type Plan = z.infer<typeof PlanSchema>;

// Subscription
export const SubscriptionSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  plan_id: z.number().int().positive(),
  stripe_subscription_id: z.string(),
  status: SubscriptionStatusSchema,
  current_period_start: z.iso.datetime(),
  current_period_end: z.iso.datetime(),
  cancel_at_period_end: z.boolean().default(false),
  canceled_at: z.iso.datetime().optional(),
  trial_end: z.iso.datetime().optional(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

// Stripe Event
export const StripeEventSchema = z.object({
  id: z.number().int().positive(),
  stripe_event_id: z.string(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()),
  received_at: z.iso.datetime(),
  processed_at: z.iso.datetime().optional(),
  success: z.boolean().default(false),
  error: z.string().optional(),
});
export type StripeEvent = z.infer<typeof StripeEventSchema>;

// Audit Log
export const AuditLogSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  entity_type: EntityTypeSchema,
  entity_id: z.string(),
  audit_action: AuditActionSchema,
  details: z.record(z.string(), z.unknown()),
  ip_address: z.string(),
  user_agent: z.string(),
  created_at: z.string(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

// Instrument
export const InstrumentSchema = z.object({
  id: z.number().int().positive(),
  symbol: z.string(),
  display_name: z.string(),
  pip_size: z.number().positive(),
  enabled: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Instrument = z.infer<typeof InstrumentSchema>;

// Dataset
export const DatasetSchema = z.object({
  id: z.number().int().positive(),
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
  source_label: z.string(),
  uploaded_by_user_id: z.number().int().positive(),
  uploaded_at: z.iso.datetime(),
  records_count: z.number().int().nonnegative(),
  file_id: z.number().int().positive(),
  is_active: z.boolean().default(true),
  start_ts: z.iso.datetime(),
  end_ts: z.iso.datetime(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Dataset = z.infer<typeof DatasetSchema>;

// Candle
export const CandleSchema = z.object({
  id: z.number().int().positive(),
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
  ts: z.iso.datetime(),
  open: z.number().positive(),
  high: z.number().positive(),
  low: z.number().positive(),
  close: z.number().positive(),
  volume: z.number().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Candle = z.infer<typeof CandleSchema>;

// Session
export const SessionSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
  session_status: SessionStatusSchema,
  speed: SpeedSchema,
  start_ts: z.iso.datetime(),
  end_ts: z.iso.datetime().optional(),
  initial_balance: z.number().positive(),
  leverage: z.number().positive(),
  spread_pts: z.number().int().nonnegative(),
  slippage_pts: z.number().int().nonnegative(),
  commission_per_fill: z.number().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Session = z.infer<typeof SessionSchema>;

// Position
export const PositionSchema = z.object({
  id: z.number().int().positive(),
  session_id: z.number().int().positive(),
  candle_id: z.number().int().positive(),
  exit_candle_id: z.number().int().positive().optional(),
  position_status: PositionStatusSchema,
  side: SideSchema,
  entry_price: z.number().positive(),
  quantity_lots: z.number().positive(),
  tp_price: z.number().positive().optional(),
  sl_price: z.number().positive().optional(),
  exit_price: z.number().positive().optional(),
  opened_at: z.iso.datetime(),
  closed_at: z.iso.datetime().optional(),
  realized_pnl: z.number(),
  commission_cost: z.number().nonnegative(),
  slippage_cost: z.number().nonnegative(),
  spread_cost: z.number().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Position = z.infer<typeof PositionSchema>;

// Transaction
export const TransactionSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  session_id: z.number().int().positive().optional(),
  position_id: z.number().int().positive().optional(),
  transaction_type: TransactionTypeSchema,
  amount: z.number(),
  balance_after: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

// Report
export const ReportSchema = z.object({
  id: z.number().int().positive(),
  session_id: z.number().int().positive(),
  summary_json: z.record(z.string(), z.unknown()),
  equity_curve_json: z.record(z.string(), z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Report = z.infer<typeof ReportSchema>;

// Support Request
export const SupportRequestSchema = z.object({
  id: z.number().int().positive(),
  requester_id: z.number().int().positive(),
  support_status: SupportStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});
export type SupportRequest = z.infer<typeof SupportRequestSchema>;

// Support Message
export const SupportMessageSchema = z.object({
  id: z.number().int().positive(),
  sender_id: z.number().int().positive(),
  support_request_id: z.number().int().positive(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type SupportMessage = z.infer<typeof SupportMessageSchema>;

// File
export const FileSchema = z.object({
  id: z.number().int().positive(),
  owner_id: z.number().int().positive(),
  entity_id: z.string(),
  path: z.string(),
  size: z.string(),
  md5: z.string(),
  uploaded_at: z.iso.datetime(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type File = z.infer<typeof FileSchema>;

// Report File
export const ReportFileSchema = z.object({
  id: z.number().int().positive(),
  report_id: z.number().int().positive(),
  file_id: z.number().int().positive(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ReportFile = z.infer<typeof ReportFileSchema>;

// Support Message File
export const SupportMessageFileSchema = z.object({
  id: z.number().int().positive(),
  support_message_id: z.number().int().positive(),
  file_id: z.number().int().positive(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type SupportMessageFile = z.infer<typeof SupportMessageFileSchema>;
