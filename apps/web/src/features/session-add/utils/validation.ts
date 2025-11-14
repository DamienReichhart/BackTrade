/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

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
 */
export const validateInstrument = (
  instrumentId: number | null,
): string | undefined => {
  if (!instrumentId) {
    return "Please select an instrument.";
  }
  return undefined;
};

/**
 * Validate speed selection
 */
export const validateSpeed = (speed: string): string | undefined => {
  if (!speed) {
    return "Please select a speed.";
  }
  return undefined;
};

/**
 * Validate leverage selection
 */
export const validateLeverage = (
  leverage: number | null,
): string | undefined => {
  if (leverage === null) {
    return "Please select a leverage.";
  }
  return undefined;
};

/**
 * Validate initial balance
 */
export const validateInitialBalance = (value: string): string | undefined => {
  if (!value || value.trim() === "") {
    return "Initial balance is required.";
  }
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    return "Initial balance must be a positive number.";
  }
  return undefined;
};

/**
 * Validate numeric field (spread, slippage, commission)
 */
export const validateNumericField = (
  value: string,
  fieldName: string,
): string | undefined => {
  if (!value || value.trim() === "") {
    return `${fieldName} is required.`;
  }
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    return `${fieldName} must be a non-negative number.`;
  }
  return undefined;
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

export const validateStartTsVsEndTs = (
  startTs: string,
  endTs: string,
): string | undefined => {
  const startDate = new Date(formatLocalDateTimeToISO(startTs));
  const endDate = new Date(formatLocalDateTimeToISO(endTs));
  if (endDate < startDate) {
    return "End time must be after or equal to start time.";
  }
  return undefined;
};
