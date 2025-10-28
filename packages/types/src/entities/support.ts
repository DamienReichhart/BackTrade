import { z } from "zod";
import { SupportStatusSchema } from "../enums";

export const SupportRequestSchema = z.object({
  id: z.number().int().positive(),
  requester_id: z.number().int().positive(),
  support_status: SupportStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});
export type SupportRequest = z.infer<typeof SupportRequestSchema>;

export const SupportMessageSchema = z.object({
  id: z.number().int().positive(),
  sender_id: z.number().int().positive(),
  support_request_id: z.number().int().positive(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type SupportMessage = z.infer<typeof SupportMessageSchema>;

export const SupportMessageFileSchema = z.object({
  id: z.number().int().positive(),
  support_message_id: z.number().int().positive(),
  file_id: z.number().int().positive(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type SupportMessageFile = z.infer<typeof SupportMessageFileSchema>;
