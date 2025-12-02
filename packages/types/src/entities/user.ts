import { z } from "zod";
import { RoleSchema } from "../enums";

export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  password_hash: z.string(),
  role: RoleSchema,
  is_banned: z.boolean().default(false),
  stripe_customer_id: z.string().optional().nullable(),
  password_reset_code: z.string().optional().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type User = z.infer<typeof UserSchema>;

export const PublicUserSchema = UserSchema.omit({
  password_hash: true,
  password_reset_code: true,
});
export type PublicUser = z.infer<typeof PublicUserSchema>;

export const UserSessionSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  ip_address: z.string(),
  user_agent: z.string(),
  device_info: z.string(),
  issued_at: z.iso.datetime(),
  created_at: z.string().optional(), // optional only for the front only, will be required when backend is impelemnted
  updated_at: z.string().optional(),
});
export type UserSession = z.infer<typeof UserSessionSchema>;
