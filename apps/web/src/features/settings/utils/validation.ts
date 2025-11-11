/**
 * Email validation result
 */
export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns Validation result
 */
export function validateEmail(email: string): EmailValidationResult {
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
 *
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePassword(password: string): PasswordValidationResult {
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
 *
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Validation result
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string,
): PasswordValidationResult {
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords don't match" };
  }

  return validatePassword(password);
}
