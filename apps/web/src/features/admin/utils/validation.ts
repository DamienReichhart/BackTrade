/**
 * Validation utilities for admin feature
 */

/**
 * Re-export email validation from shared package
 */
export { validateEmail } from "@backtrade/utils";

/**
 * Validate role
 */
export function validateRole(role: string): {
  isValid: boolean;
  error?: string;
} {
  if (!role) {
    return { isValid: false, error: "Role is required" };
  }

  const validRoles = ["ANONYMOUS", "USER", "ADMIN"];
  if (!validRoles.includes(role)) {
    return { isValid: false, error: "Invalid role" };
  }

  return { isValid: true };
}
