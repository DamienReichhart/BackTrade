/**
 * PII Masking Utilities
 *
 * Utilities for masking personally identifiable information (PII) in logs
 * to comply with GDPR, CCPA, and other privacy regulations.
 */

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
 * Masks an email address for logging purposes
 *
 * Always masks the email address to comply with GDPR, CCPA, and other privacy regulations.
 * This function should be used whenever logging email addresses.
 *
 * @param email - Email address to mask
 * @returns Masked email address (e.g., "j***@example.com")
 *
 * @example
 * ```ts
 * maskEmailForLogging("john@example.com") // "j***@example.com"
 * maskEmailForLogging("user@example.com") // "u***@example.com"
 * ```
 */
export function maskEmailForLogging(email: string): string {
    return maskEmail(email);
}
