/**
 * Validation utilities for dataset management feature
 */

/**
 * Validate instrument ID
 *
 * @param value - The instrument ID value to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateInstrumentId(value: string): {
  isValid: boolean;
  error?: string;
} {
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
export function validateTimeframe(value: string): {
  isValid: boolean;
  error?: string;
} {
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

/**
 * Validate date string
 *
 * @param value - The date string to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result with isValid flag and optional error message
 */
export function validateDate(
  value: string,
  fieldName: string,
): {
  isValid: boolean;
  error?: string;
} {
  if (!value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${fieldName} must be a valid date` };
  }

  return { isValid: true };
}

/**
 * Validate date range
 *
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Validation result with isValid flag and optional error message
 */
export function validateDateRange(
  startDate: string,
  endDate: string,
): {
  isValid: boolean;
  error?: string;
} {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return { isValid: false, error: "End date must be after start date" };
  }

  return { isValid: true };
}

/**
 * Validate file selection for upload
 *
 * @param file - File object to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateFile(file: File | null): {
  isValid: boolean;
  error?: string;
} {
  if (!file) {
    return { isValid: false, error: "Please select a file" };
  }

  // Check file size (max 1000MB)
  const maxSize = 1000 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: "File size must not exceed 100MB" };
  }

  // Check file extension (CSV)
  const validExtensions = [".csv"];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some((ext) =>
    fileName.endsWith(ext),
  );

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: "File must be a CSV file",
    };
  }

  return { isValid: true };
}
