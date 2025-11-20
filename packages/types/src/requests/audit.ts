import { z } from "zod";
import { AuditLogSchema } from "../entities";

export const AuditLogListResponseSchema = z.array(AuditLogSchema);
export type AuditLogListResponse = z.infer<typeof AuditLogListResponseSchema>;
