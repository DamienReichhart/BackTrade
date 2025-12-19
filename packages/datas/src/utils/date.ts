/**
 * Convert an ISO datetime string or Date to ClickHouse DateTime format.
 *
 * ClickHouse DateTime expects: YYYY-MM-DD HH:MM:SS (no timezone, no milliseconds)
 * ISO 8601 format is: YYYY-MM-DDTHH:MM:SS.sssZ
 *
 * @param isoString - ISO datetime string or Date object
 * @returns ClickHouse-compatible datetime string
 */
export function toClickHouseDateTime(isoString: string | Date): string {
    const date =
        typeof isoString === "string" ? new Date(isoString) : isoString;
    // Format as YYYY-MM-DD HH:MM:SS in UTC
    return date
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d{3}Z$/, "");
}
