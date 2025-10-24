import { z } from "zod";
import { PublicUserSchema } from "../entities";
import { RoleSchema } from "../enums";

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
