import { z } from "zod";

// =========================
// ENUMS
// =========================

export const RoleSchema = z.enum(["ANONYMOUS", "ADMIN"]);
export type Role = z.infer<typeof RoleSchema>;

export const SessionStatusSchema = z.enum([
  "DRAFT",
  "RUNNING",
  "PAUSED",
  "COMPLETED",
  "ARCHIVED",
]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const PositionStatusSchema = z.enum(["OPEN", "CLOSED", "LIQUIDATED"]);
export type PositionStatus = z.infer<typeof PositionStatusSchema>;

export const TimeframeSchema = z.enum([
  "M1",
  "M5",
  "M10",
  "M15",
  "M30",
  "H1",
  "H2",
  "H4",
  "D1",
  "W1",
]);
export type Timeframe = z.infer<typeof TimeframeSchema>;

export const SideSchema = z.enum(["BUY", "SELL"]);
export type Side = z.infer<typeof SideSchema>;

export const SpeedSchema = z.enum([
  "0.5x",
  "1x",
  "2x",
  "3x",
  "5x",
  "10x",
  "15x",
]);
export type Speed = z.infer<typeof SpeedSchema>;

export const SupportStatusSchema = z.enum([
  "OPEN",
  "CLOSED",
  "PENDING_APPROVAL",
]);
export type SupportStatus = z.infer<typeof SupportStatusSchema>;

export const TransactionTypeSchema = z.enum([
  "DEPOSIT",
  "WITHDRAWAL",
  "COMMISSION",
  "PNL",
  "SLIPPAGE",
  "SPREAD",
  "ADJUSTMENT",
]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const EntityTypeSchema = z.enum([
  "USER",
  "SESSION",
  "TRANSACTION",
  "SUBSCRIPTION",
  "POSITION",
]);
export type EntityType = z.infer<typeof EntityTypeSchema>;

export const AuditActionSchema = z.enum([
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "PASSWORD_CHANGE",
  "ROLE_CHANGE",
  "BAN",
  "UNBAN",
]);
export type AuditAction = z.infer<typeof AuditActionSchema>;

export const SubscriptionStatusSchema = z.enum([
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "trialing",
  "unpaid",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
