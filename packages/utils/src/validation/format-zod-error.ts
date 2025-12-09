import type { z } from "zod";
import { sanitizeForJson } from "./sanitize-string";

/**
 * Formats Zod validation errors into a user-friendly, JSON-compatible message.
 *
 * This function:
 * - Extracts individual field errors from Zod's error object
 * - Sanitizes messages to remove problematic characters (newlines, control chars)
 * - Formats errors in a clear, readable format
 * - Groups multiple errors into a single message
 *
 * Note: While Express's res.json() handles JSON escaping automatically,
 * this function ensures the message is clean and readable for users.
 *
 * @param error - Zod error object from validation failure
 * @returns Formatted error message suitable for JSON responses
 */
export function formatZodError(error: z.ZodError): string {
    const issues = error.issues;

    // If there's only one error, return a simple formatted message
    if (issues.length === 1) {
        const issue = issues[0];
        if (!issue) {
            return "Validation error";
        }
        const path = issue.path.length > 0 ? issue.path.join(".") : "input";
        const message = sanitizeForJson(issue.message);
        return `${path}: ${message}`;
    }

    // For multiple errors, format them as a list
    const formattedErrors = issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "input";
        const message = sanitizeForJson(issue.message);
        return `${path}: ${message}`;
    });

    return formattedErrors.join("; ");
}
