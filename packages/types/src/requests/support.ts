import { z } from "zod";
import { SupportRequestSchema } from "../entities";
import { SupportStatusSchema } from "../enums";

export const CreateSupportRequestSchema = z.object({
  requester_id: z.number().int().positive(),
  support_status: SupportStatusSchema.default("OPEN"),
});
export type CreateSupportRequest = z.infer<typeof CreateSupportRequestSchema>;

export const UpdateSupportRequestSchema = z.object({
  support_status: SupportStatusSchema.optional(),
});
export type UpdateSupportRequest = z.infer<typeof UpdateSupportRequestSchema>;

export const CreateSupportMessageSchema = z.object({
  sender_id: z.number().int().positive(),
  support_request_id: z.number().int().positive(),
  content: z.string().min(1),
});
export type CreateSupportMessage = z.infer<typeof CreateSupportMessageSchema>;

export const UpdateSupportMessageSchema = z.object({
  content: z.string().min(1).optional(),
});
export type UpdateSupportMessage = z.infer<typeof UpdateSupportMessageSchema>;

export const SupportRequestListResponseSchema = z.object({
  support_requests: z.array(SupportRequestSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type SupportRequestListResponse = z.infer<
  typeof SupportRequestListResponseSchema
>;
