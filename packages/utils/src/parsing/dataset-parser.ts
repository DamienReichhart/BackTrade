/**
 * Dataset Parser Utilities
 *
 * Utilities for parsing dataset CSV lines into candle data.
 * Handles the specific format: date,time,open,high,low,close,volume
 * Example: 2025.01.01,18:00,2625.098000,2626.005000,2624.355000,2625.048000,0
 */

/**
 * Result of parsing a single dataset line
 */
export interface ParsedCandleData {
    /** ISO datetime timestamp */
    ts: string;
    /** Opening price */
    open: number;
    /** Highest price */
    high: number;
    /** Lowest price */
    low: number;
    /** Closing price */
    close: number;
    /** Trading volume */
    volume: number;
}

/**
 * Result of a parse operation
 */
export interface ParseResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Parse a dataset date and time string into an ISO datetime
 *
 * Converts from format "YYYY.MM.DD" and "HH:MM" to ISO datetime string.
 *
 * @param dateStr - Date string in format "YYYY.MM.DD" (e.g., "2025.01.01")
 * @param timeStr - Time string in format "HH:MM" (e.g., "18:00")
 * @returns ISO datetime string (e.g., "2025-01-01T18:00:00.000Z")
 *
 * @example
 * parseDatasetDateTime("2025.01.01", "18:00")
 * // Returns: "2025-01-01T18:00:00.000Z"
 */
export function parseDatasetDateTime(dateStr: string, timeStr: string): string {
    // Convert date from "YYYY.MM.DD" to "YYYY-MM-DD"
    const [year, month, day] = dateStr.split(".");

    if (!year || !month || !day) {
        throw new Error(`Invalid date format: ${dateStr}. Expected YYYY.MM.DD`);
    }

    // Validate date components
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) {
        throw new Error(`Invalid date values: ${dateStr}`);
    }

    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
        throw new Error(`Date out of range: ${dateStr}`);
    }

    // Validate time format
    const [hours, minutes] = timeStr.split(":");

    if (!hours || !minutes) {
        throw new Error(`Invalid time format: ${timeStr}. Expected HH:MM`);
    }

    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);

    if (isNaN(hoursNum) || isNaN(minutesNum)) {
        throw new Error(`Invalid time values: ${timeStr}`);
    }

    if (hoursNum < 0 || hoursNum > 23 || minutesNum < 0 || minutesNum > 59) {
        throw new Error(`Time out of range: ${timeStr}`);
    }

    // Build ISO datetime string
    const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const isoTime = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00.000Z`;

    return `${isoDate}T${isoTime}`;
}

/**
 * Parse a single dataset CSV line into candle data
 *
 * Line format: date,time,open,high,low,close,volume
 * Example: 2025.01.01,18:00,2625.098000,2626.005000,2624.355000,2625.048000,0
 *
 * @param line - CSV line to parse
 * @returns Parsed candle data
 * @throws Error if line format is invalid
 *
 * @example
 * parseDatasetLine("2025.01.01,18:00,2625.098000,2626.005000,2624.355000,2625.048000,0")
 * // Returns: {
 * //   ts: "2025-01-01T18:00:00.000Z",
 * //   open: 2625.098,
 * //   high: 2626.005,
 * //   low: 2624.355,
 * //   close: 2625.048,
 * //   volume: 0
 * // }
 */
export function parseDatasetLine(line: string): ParsedCandleData {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
        throw new Error("Empty line");
    }

    const parts = trimmedLine.split(",");

    if (parts.length !== 7) {
        throw new Error(
            `Invalid line format: expected 7 comma-separated values, got ${parts.length}. Line: ${trimmedLine}`
        );
    }

    const [dateStr, timeStr, openStr, highStr, lowStr, closeStr, volumeStr] =
        parts;

    // Parse datetime
    const ts = parseDatasetDateTime(dateStr!, timeStr!);

    // Parse OHLCV values
    const open = parseFloat(openStr!);
    const high = parseFloat(highStr!);
    const low = parseFloat(lowStr!);
    const close = parseFloat(closeStr!);
    const volume = parseFloat(volumeStr!);

    // Validate parsed values
    if (
        isNaN(open) ||
        isNaN(high) ||
        isNaN(low) ||
        isNaN(close) ||
        isNaN(volume)
    ) {
        throw new Error(`Invalid numeric values in line: ${trimmedLine}`);
    }

    // Basic sanity checks for OHLC values
    if (high < low) {
        throw new Error(
            `Invalid OHLC: high (${high}) is less than low (${low})`
        );
    }

    if (open < 0 || high < 0 || low < 0 || close < 0) {
        throw new Error(`Invalid OHLC: negative values not allowed`);
    }

    if (volume < 0) {
        throw new Error(`Invalid volume: negative value not allowed`);
    }

    return {
        ts,
        open,
        high,
        low,
        close,
        volume,
    };
}

/**
 * Safely parse a dataset line, returning a result object instead of throwing
 *
 * @param line - CSV line to parse
 * @returns Parse result with success flag and data or error
 *
 * @example
 * const result = safeParseDatasetLine("2025.01.01,18:00,100,110,90,105,1000");
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 */
export function safeParseDatasetLine(
    line: string
): ParseResult<ParsedCandleData> {
    try {
        const data = parseDatasetLine(line);
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/**
 * Parse multiple dataset lines, collecting valid candles and errors
 *
 * @param lines - Array of CSV lines to parse
 * @returns Object containing parsed candles and any errors encountered
 *
 * @example
 * const { candles, errors } = parseDatasetLines(["line1", "line2"]);
 */
export function parseDatasetLines(lines: string[]): {
    candles: ParsedCandleData[];
    errors: Array<{ lineNumber: number; line: string; error: string }>;
} {
    const candles: ParsedCandleData[] = [];
    const errors: Array<{ lineNumber: number; line: string; error: string }> =
        [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const result = safeParseDatasetLine(line);

        if (result.success && result.data) {
            candles.push(result.data);
        } else {
            errors.push({
                lineNumber: i + 1,
                line,
                error: result.error ?? "Unknown error",
            });
        }
    }

    return { candles, errors };
}
