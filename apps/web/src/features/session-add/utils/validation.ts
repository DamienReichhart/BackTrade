/**
 * Frontend-specific validation utilities for session-add feature
 * Generic validations are in @backtrade/utils
 */

import {
  type ValidationResult,
  validateRequired,
  validateRequiredString,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateDateRange,
} from "@backtrade/utils";

/**
 * Validate datetime-local input value
 *
 * @param value - datetime-local input value (YYYY-MM-DDTHH:mm format)
 * @returns Validation result
 */
export function validateDateTime(value: string): ValidationResult {
  if (!value) {
    return {
      isValid: false,
      error: "Date and time are required.",
    };
  }

  // Check if the value matches the datetime-local format
  const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  if (!datetimeRegex.test(value)) {
    return {
      isValid: false,
      error: "Invalid date and time format.",
    };
  }

  // Try to parse the date
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: "Invalid date and time value.",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Convert datetime-local value to ISO datetime string
 *
 * @param localDateTime - datetime-local input value (YYYY-MM-DDTHH:mm format)
 * @returns ISO datetime string (YYYY-MM-DDTHH:mm:ss.sssZ format)
 */
export function formatLocalDateTimeToISO(localDateTime: string): string {
  // datetime-local format: YYYY-MM-DDTHH:mm
  // We need to convert it to ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
  // The datetime-local doesn't include seconds or timezone, so we add them
  const date = new Date(localDateTime);
  return date.toISOString();
}

/**
 * Convert ISO datetime string to datetime-local value
 *
 * @param isoDateTime - ISO datetime string
 * @returns datetime-local value (YYYY-MM-DDTHH:mm format)
 */
export function formatISOToLocalDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  // Format: YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Validate instrument selection
 * Wrapper around validateRequired for convenience
 */
export const validateInstrument = (
  instrumentId: number | null,
): string | undefined => {
  const result = validateRequired(instrumentId, "Instrument");
  return result.isValid ? undefined : result.error;
};

/**
 * Validate speed selection
 * Wrapper around validateRequiredString for convenience
 */
export const validateSpeed = (speed: string): string | undefined => {
  const result = validateRequiredString(speed, "Speed");
  return result.isValid ? undefined : result.error;
};

/**
 * Validate leverage selection
 * Wrapper around validateRequired for convenience
 */
export const validateLeverage = (
  leverage: number | null,
): string | undefined => {
  const result = validateRequired(leverage, "Leverage");
  return result.isValid ? undefined : result.error;
};

/**
 * Validate initial balance
 * Wrapper around validatePositiveNumber for convenience
 */
export const validateInitialBalance = (value: string): string | undefined => {
  const result = validatePositiveNumber(value, "Initial balance");
  return result.isValid ? undefined : result.error;
};

/**
 * Validate numeric field (spread, slippage, commission)
 * Wrapper around validateNonNegativeNumber for convenience
 */
export const validateNumericField = (
  value: string,
  fieldName: string,
): string | undefined => {
  const result = validateNonNegativeNumber(value, fieldName);
  return result.isValid ? undefined : result.error;
};

/**
 * Validate datetime field
 */
export const validateDateTimeField = (
  value: string,
  fieldName: string,
  isRequired: boolean = true,
): string | undefined => {
  if (!value || value.trim() === "") {
    return isRequired ? `${fieldName} is required.` : undefined;
  }
  const validation = validateDateTime(value);
  if (!validation.isValid) {
    return validation.error;
  }
  return undefined;
};

/**
 * Validate start timestamp vs end timestamp
 * Converts datetime-local to ISO format before validation
 * Wrapper around validateDateRange for convenience
 */
export const validateStartTsVsEndTs = (
  startTs: string,
  endTs: string,
): string | undefined => {
  // Convert datetime-local to ISO format for validation
  const startISO = formatLocalDateTimeToISO(startTs);
  const endISO = formatLocalDateTimeToISO(endTs);

  const result = validateDateRange(startISO, endISO);
  return result.isValid ? undefined : result.error;
};
