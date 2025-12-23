/**
 * Dataset Parser Utilities
 *
 * Utilities for parsing dataset CSV lines into candle data.
 * Handles the format: timestamp,open,high,low,close,volume
 * Example: 1764543600,0.89500000,0.89701864,0.89344566,0.89496843,59823147.2954
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
 * Convert a Unix timestamp (seconds) to an ISO datetime string
 *
 * @param timestamp - Unix timestamp in seconds
 * @returns ISO datetime string (e.g., "2025-12-01T01:00:00.000Z")
 * @throws Error if timestamp is invalid
 *
 * @example
 * parseUnixTimestamp(1764543600)
 * // Returns: "2025-12-01T01:00:00.000Z"
 */
export function parseUnixTimestamp(timestamp: number): string {
    if (!Number.isFinite(timestamp) || timestamp < 0) {
        throw new Error(
            `Invalid timestamp: ${timestamp}. Expected positive number.`
        );
    }

    // Convert seconds to milliseconds and create Date
    const date = new Date(timestamp * 1000);

    // Validate the date is valid
    if (isNaN(date.getTime())) {
        throw new Error(
            `Invalid timestamp: ${timestamp}. Could not convert to date.`
        );
    }

    return date.toISOString();
}

/**
 * Parse a single dataset CSV line into candle data
 *
 * Line format: timestamp,open,high,low,close,volume
 * Example: 1764543600,0.89500000,0.89701864,0.89344566,0.89496843,59823147.2954
 *
 * @param line - CSV line to parse
 * @returns Parsed candle data
 * @throws Error if line format is invalid
 *
 * @example
 * parseDatasetLine("1764543600,0.89500000,0.89701864,0.89344566,0.89496843,59823147.2954")
 * // Returns: {
 * //   ts: "2025-12-01T01:00:00.000Z",
 * //   open: 0.895,
 * //   high: 0.89701864,
 * //   low: 0.89344566,
 * //   close: 0.89496843,
 * //   volume: 59823147.2954
 * // }
 */
export function parseDatasetLine(line: string): ParsedCandleData {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
        throw new Error("Empty line");
    }

    const parts = trimmedLine.split(",");

    if (parts.length !== 6) {
        throw new Error(
            `Invalid line format: expected 6 comma-separated values, got ${parts.length}. Line: ${trimmedLine}`
        );
    }

    const [timestampStr, openStr, highStr, lowStr, closeStr, volumeStr] = parts;

    // Parse timestamp
    const timestamp = parseInt(timestampStr!, 10);
    if (isNaN(timestamp)) {
        throw new Error(`Invalid timestamp value: ${timestampStr}`);
    }
    const ts = parseUnixTimestamp(timestamp);

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
 * const result = safeParseDatasetLine("1764543600,0.895,0.897,0.893,0.895,59823147");
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
 * const { candles, errors } = parseDatasetLines([
 *   "1764543600,0.895,0.897,0.893,0.895,59823147",
 *   "1764547200,0.895,0.897,0.893,0.896,61709200"
 * ]);
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
