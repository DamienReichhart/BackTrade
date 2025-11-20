import type { ValidationResult } from "./types";

/**
 * Validate file selection for upload
 *
 * @param file - File object to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateFile(file: File | null): ValidationResult {
  if (!file) {
    return { isValid: false, error: "Please select a file" };
  }

  // Check file size (max 1000MB)
  const maxSize = 1000 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: "File size must not exceed 1000MB" };
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
