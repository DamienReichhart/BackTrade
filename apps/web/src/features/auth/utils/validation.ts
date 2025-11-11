/**
 * Re-export shared validation utilities from @backtrade/utils
 */
import type { ValidationResult } from "@backtrade/utils";
export type { ValidationResult };
export {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "@backtrade/utils";

/**
 * Validate name (feature-specific validation)
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
