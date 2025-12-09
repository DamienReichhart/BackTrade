/**
 * Validation utilities for BackTrade
 * This module exports all validation functions organized by category.
 */

// Types
export type {
    ValidationResult,
    EmailValidationResult,
    PasswordValidationResult,
} from "./types";

// User validations
export {
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
    validateName,
    validateRole,
} from "./user";

// Trading validations
export { validateInstrumentId, validateTimeframe } from "./trading";

// File validations
export { validateFile } from "./file";

// Number validations
export { validatePositiveNumber, validateNonNegativeNumber } from "./number";

// Date and required validations
export {
    validateRequired,
    validateRequiredString,
    validateDateRange,
} from "./date";

// API validations
export { validateApiInput, validateApiOutput } from "./api";

// Zod error formatting
export { formatZodError } from "./format-zod-error";

// String sanitization
export { sanitizeForJson } from "./sanitize-string";
