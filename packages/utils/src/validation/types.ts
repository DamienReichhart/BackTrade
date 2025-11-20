/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation result (alias for ValidationResult for backward compatibility)
 */
export type EmailValidationResult = ValidationResult;

/**
 * Password validation result (alias for ValidationResult for backward compatibility)
 */
export type PasswordValidationResult = ValidationResult;
