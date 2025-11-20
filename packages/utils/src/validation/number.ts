import type { ValidationResult } from "./types";

/**
 * Validate positive number
 *
 * @param value - The value to validate (string or number)
 * @param fieldName - Name of the field for error message
 * @returns Validation result with isValid flag and optional error message
 */
export function validatePositiveNumber(
  value: string | number,
  fieldName: string = "Value",
): ValidationResult {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (num <= 0) {
    return { isValid: false, error: `${fieldName} must be a positive number` };
  }

  return { isValid: true };
}

/**
 * Validate non-negative number
 *
 * @param value - The value to validate (string or number)
 * @param fieldName - Name of the field for error message
 * @returns Validation result with isValid flag and optional error message
 */
export function validateNonNegativeNumber(
  value: string | number,
  fieldName: string = "Value",
): ValidationResult {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (num < 0) {
    return {
      isValid: false,
      error: `${fieldName} must be a non-negative number`,
    };
  }

  return { isValid: true };
}
