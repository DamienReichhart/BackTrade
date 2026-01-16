import { type z } from "zod";
import { UpdateUserRequestSchema } from "@backtrade/types";

/**
 * Account settings form schema (Email update)
 */
export const AccountFormSchema = UpdateUserRequestSchema.pick({
    email: true,
}).required({
    email: true,
});

export type AccountFormState = z.infer<typeof AccountFormSchema>;

/**
 * Admin User Edit form schema
 */
export const UserEditFormSchema = UpdateUserRequestSchema.pick({
    email: true,
    role: true,
    is_banned: true,
});

export type UserEditFormState = z.infer<typeof UserEditFormSchema>;
