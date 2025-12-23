import { z } from "zod";

export const RoleSchema = z.enum(["ANONYMOUS", "USER", "ADMIN"]);
export type Role = z.infer<typeof RoleSchema>;

/**
 * Get all Role enum values as an array
 */
export const ROLE_VALUES: Role[] = ["ANONYMOUS", "USER", "ADMIN"];

/**
 * Map Role to display label
 */
const ROLE_DISPLAY_MAP: Record<Role, string> = {
    ANONYMOUS: "Anonymous",
    USER: "User",
    ADMIN: "Admin",
};

/**
 * Get display label for a Role enum value
 */
export function getRoleDisplayLabel(role: Role): string {
    return ROLE_DISPLAY_MAP[role] ?? role;
}

/**
 * Get Role options for select dropdowns
 */
export function getRoleOptions(): Array<{ value: Role; label: string }> {
    return ROLE_VALUES.map((role) => ({
        value: role,
        label: getRoleDisplayLabel(role),
    }));
}
