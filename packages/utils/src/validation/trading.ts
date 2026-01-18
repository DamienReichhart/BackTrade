import type { ValidationResult } from "./types";

/**
 * Validate instrument ID
 *
 * @param value - The instrument ID value to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateInstrumentId(value: string): ValidationResult {
    if (!value.trim()) {
        return { isValid: false, error: "Instrument ID is required" };
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue <= 0 || !Number.isInteger(numValue)) {
        return {
            isValid: false,
            error: "Instrument ID must be a positive integer",
        };
    }

    return { isValid: true };
}

/**
 * Validate timeframe selection
 *
 * @param value - The timeframe value to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateTimeframe(value: string): ValidationResult {
    if (!value.trim()) {
        return { isValid: false, error: "Timeframe is required" };
    }

    const validTimeframes = [
        "M1",
        "M5",
        "M10",
        "M15",
        "M30",
        "H1",
        "H2",
        "H4",
        "D1",
        "W1",
    ];
    if (!validTimeframes.includes(value)) {
        return { isValid: false, error: "Invalid timeframe selected" };
    }

    return { isValid: true };
}
