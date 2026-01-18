import type { ValidationResult } from "./types";

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateEmail(email: string): ValidationResult {
    if (!email || email.trim() === "") {
        return { isValid: false, error: "Email is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: "Invalid email format" };
    }

    return { isValid: true };
}

/**
 * Validate password strength
 * Currently enforces minimum length of 8 characters.
 * Can be extended to include more complex requirements (uppercase, lowercase, numbers, special chars).
 *
 * @param password - Password to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validatePassword(password: string): ValidationResult {
    if (!password || password.length === 0) {
        return { isValid: false, error: "Password is required" };
    }

    if (password.length < 8) {
        return {
            isValid: false,
            error: "Password must be at least 8 characters",
        };
    }

    return { isValid: true };
}

/**
 * Validate password confirmation
 * Checks that both passwords match and that the password itself is valid.
 *
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Validation result with isValid flag and optional error message
 */
export function validatePasswordConfirmation(
    password: string,
    confirmPassword: string
): ValidationResult {
    if (password !== confirmPassword) {
        return { isValid: false, error: "Passwords don't match" };
    }

    return validatePassword(password);
}

/**
 * Validate name
 *
 * @param name - Name to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateName(name: string): ValidationResult {
    if (name.length === 0) {
        return { isValid: false, error: "Enter your name." };
    }

    if (name.length < 2) {
        return { isValid: false, error: "Name must be at least 2 characters." };
    }

    return { isValid: true };
}

/**
 * Validate role
 *
 * @param role - Role to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateRole(role: string): ValidationResult {
    if (!role) {
        return { isValid: false, error: "Role is required" };
    }

    const validRoles = ["ANONYMOUS", "USER", "ADMIN"];
    if (!validRoles.includes(role)) {
        return { isValid: false, error: "Invalid role" };
    }

    return { isValid: true };
}
