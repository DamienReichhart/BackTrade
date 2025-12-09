/**
 * Sanitizes a string to be safe for JSON serialization.
 * Removes or replaces characters that could break JSON parsing.
 *
 * This function:
 * - Replaces newlines, carriage returns, and tabs with spaces
 * - Removes control characters (except space)
 * - Collapses multiple consecutive spaces into a single space
 * - Trims leading and trailing whitespace
 *
 * @param str - String to sanitize
 * @returns Sanitized string safe for JSON serialization
 */
export function sanitizeForJson(str: string): string {
    return (
        str
            // Replace newlines with spaces
            .replace(/\n/g, " ")
            // Replace carriage returns with spaces
            .replace(/\r/g, " ")
            // Replace tabs with spaces
            .replace(/\t/g, " ")
            // Replace multiple consecutive spaces with a single space
            .replace(/\s+/g, " ")
            // Remove control characters (except space)
            .replace(/[\x00-\x1F\x7F]/g, "")
            .trim()
    );
}
