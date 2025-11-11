/**
 * Validation utilities for admin feature
 */

/**
 * Validate email format
 */
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email.trim()) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true };
}

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
