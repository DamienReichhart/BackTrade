import { z } from "zod";

export const RoleSchema = z.enum(["ANONYMOUS", "USER", "ADMIN"]);
export type Role = z.infer<typeof RoleSchema>;
