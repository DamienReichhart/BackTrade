import { z } from "zod";

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
