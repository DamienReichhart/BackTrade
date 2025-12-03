import type { PublicUser } from "@backtrade/types";

/**
 * Formatting utilities for UserTable component
 */

/**
 * Get role badge class name
 *
 * @param role - User role
 * @returns CSS class name for the role badge
 */
export function getRoleBadgeClassName(role: PublicUser["role"]): string {
    switch (role) {
        case "ADMIN":
            return "roleAdmin";
        case "USER":
            return "roleUser";
        case "ANONYMOUS":
            return "roleAnonymous";
        default:
            return "";
    }
}

/**
 * Get status badge class name
 *
 * @param isBanned - Whether the user is banned
 * @returns CSS class name for the status badge
 */
export function getStatusBadgeClassName(isBanned: boolean): string {
    return isBanned ? "bannedBadge" : "activeBadge";
}

/**
 * Get status label
 *
 * @param isBanned - Whether the user is banned
 * @returns Status label text
 */
export function getStatusLabel(isBanned: boolean): string {
    return isBanned ? "Banned" : "Active";
}
