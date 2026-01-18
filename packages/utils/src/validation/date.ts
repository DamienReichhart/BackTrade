import type { ValidationResult } from "./types";

/**
 * Validate that a value is not null or undefined
 *
 * @param value - The value to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result with isValid flag and optional error message
 */
export function validateRequired<T>(
    value: T | null | undefined,
    fieldName: string = "Field"
): ValidationResult {
    if (value === null || value === undefined) {
        return { isValid: false, error: `${fieldName} is required` };
    }

    return { isValid: true };
}

/**
 * Validate that a string is not empty
 *
 * @param value - The string to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result with isValid flag and optional error message
 */
export function validateRequiredString(
    value: string,
    fieldName: string = "Field"
): ValidationResult {
    if (!value || value.trim() === "") {
        return { isValid: false, error: `${fieldName} is required` };
    }

    return { isValid: true };
}

/**
 * Validate date range (end date must be after or equal to start date)
 *
 * @param startDate - Start date string (ISO format)
 * @param endDate - End date string (ISO format)
 * @returns Validation result with isValid flag and optional error message
 */
export function validateDateRange(
    startDate: string,
    endDate: string
): ValidationResult {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
        return { isValid: false, error: "Start date is invalid" };
    }

    if (isNaN(end.getTime())) {
        return { isValid: false, error: "End date is invalid" };
    }

    if (end < start) {
        return {
            isValid: false,
            error: "End date must be after or equal to start date",
        };
    }

    return { isValid: true };
}
