import { z } from "zod";
import { EntityTypeSchema, AuditActionSchema } from "../enums";

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
