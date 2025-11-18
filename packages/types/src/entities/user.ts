import { z } from "zod";
import { RoleSchema } from "../enums";

export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  password_hash: z.string(),
  role: RoleSchema,
  is_banned: z.boolean().default(false),
  stripe_customer_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const PublicUserSchema = UserSchema.omit({
  password_hash: true,
});
export type PublicUser = z.infer<typeof PublicUserSchema>;

export const UserPasswordChangeCodeSchema = z.object({
  code: z.string(),
  user_id: z.number().int().positive(),
  created_at: z.string(),
});
export type UserPasswordChangeCode = z.infer<
  typeof UserPasswordChangeCodeSchema
>;

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
