import { z } from "zod";

export const RoleSchema = z.enum(["ANONYMOUS", "ADMIN"]);
export type Role = z.infer<typeof RoleSchema>;
