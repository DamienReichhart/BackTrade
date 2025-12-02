/**
 * Format session metadata for display
 *
 * @param value - Value to format
 * @param fallback - Fallback value if value is undefined/null
 * @returns Formatted string
 */
export function formatMetadata(
    value: string | undefined | null,
    fallback = "-"
): string {
    return value ?? fallback;
}
