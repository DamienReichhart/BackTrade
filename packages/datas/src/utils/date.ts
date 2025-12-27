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

/**
 * Convert a ClickHouse DateTime string or any datetime to ISO 8601 format.
 *
 * ClickHouse returns: YYYY-MM-DD HH:MM:SS (no timezone, no T separator)
 * ISO 8601 format is: YYYY-MM-DDTHH:MM:SS.sssZ
 *
 * @param clickHouseDateTime - ClickHouse datetime string, ISO string, or Date object
 * @returns ISO 8601 formatted datetime string
 */
export function toISODateTime(
    clickHouseDateTime: string | Date | undefined | null
): string {
    if (!clickHouseDateTime) {
        return new Date().toISOString();
    }

    if (clickHouseDateTime instanceof Date) {
        return clickHouseDateTime.toISOString();
    }

    // If already in ISO format (YYYY-MM-DDTHH:MM:SS with optional fractional seconds and timezone), return as-is
    // Matches: YYYY-MM-DDTHH:MM:SS, YYYY-MM-DDTHH:MM:SS.sss, YYYY-MM-DDTHH:MM:SSZ, YYYY-MM-DDTHH:MM:SS+HH:MM, etc.
    if (
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})?$/.test(
            clickHouseDateTime
        )
    ) {
        return clickHouseDateTime;
    }

    // ClickHouse format: "YYYY-MM-DD HH:MM:SS" - convert to ISO
    // Assume UTC timezone for ClickHouse datetimes
    return new Date(clickHouseDateTime.replace(" ", "T") + "Z").toISOString();
}
