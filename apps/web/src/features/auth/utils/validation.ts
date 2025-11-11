/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns Validation result
 */
export function validateEmail(email: string): ValidationResult {
  if (email.length === 0) {
    return { isValid: false, error: "Enter a valid email." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Enter a valid email." };
  }

  return { isValid: true };
}

/**
 * Validate password
 *
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePassword(password: string): ValidationResult {
  if (password.length === 0) {
    return { isValid: false, error: "Minimum 8 characters." };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Minimum 8 characters." };
  }

  return { isValid: true };
}

/**
 * Validate name
 *
 * @param name - Name to validate
 * @returns Validation result
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
 * Validate password confirmation
 *
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Validation result
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string,
): ValidationResult {
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords must match." };
  }

  return { isValid: true };
}
