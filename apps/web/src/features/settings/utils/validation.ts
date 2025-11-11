/**
 * Re-export shared validation utilities from @backtrade/utils
 * This file is kept for backward compatibility with existing imports.
 * New code should import directly from @backtrade/utils.
 */
export type {
  ValidationResult,
  EmailValidationResult,
  PasswordValidationResult,
} from "@backtrade/utils";
export {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "@backtrade/utils";
