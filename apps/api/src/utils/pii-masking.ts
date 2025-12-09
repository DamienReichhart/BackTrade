/**
 * PII Masking Utilities
 *
 * Utilities for masking personally identifiable information (PII) in logs
 * to comply with GDPR, CCPA, and other privacy regulations.
 */

import { ENV } from "../config/env";

/**
 * Masks an email address for logging purposes
 *
 * Formats: j***@example.com
 * - Shows first character of local part
 * - Masks remaining local part with asterisks
 * - Preserves full domain for debugging context
 *
 * @param email - Email address to mask
 * @returns Masked email address (e.g., "j***@example.com")
 *
 * @example
 * ```ts
 * maskEmail("john.doe@example.com") // "j***@example.com"
 * maskEmail("a@test.co.uk") // "a***@test.co.uk"
 * maskEmail("invalid") // "***"
 * ```
 */
export function maskEmail(email: string): string {
    if (!email || typeof email !== "string") {
        return "***";
    }

    const [local, domain] = email.split("@");

    if (!local || !domain) {
        return "***";
    }

    // Show first character, mask the rest
    const maskedLocal = local[0] + "***";
    return `${maskedLocal}@${domain}`;
}

/**
 * Conditionally masks an email address based on environment
 *
 * In production, always masks the email.
 * In development/test, returns the original email for easier debugging.
 *
 * @param email - Email address to conditionally mask
 * @returns Masked email in production, original email in development/test
 *
 * @example
 * ```ts
 * // In production
 * maskEmailForLogging("john@example.com") // "j***@example.com"
 *
 * // In development
 * maskEmailForLogging("john@example.com") // "john@example.com"
 * ```
 */
export function maskEmailForLogging(email: string): string {
    // Always mask in production for PII compliance
    if (ENV.NODE_ENV === "production") {
        return maskEmail(email);
    }

    // In development/test, show full email for debugging
    return email;
}
