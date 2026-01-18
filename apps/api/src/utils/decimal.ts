/**
 * Decimal Conversion Utilities
 *
 * Utilities for handling Prisma Decimal type conversions.
 * Prisma uses Decimal.js for precise decimal arithmetic, but we often
 * need to convert these to JavaScript numbers for calculations.
 */

/**
 * Type representing a Prisma Decimal-like value
 * These have a toNumber() method for conversion
 */
interface DecimalLike {
    toNumber(): number;
}

/**
 * Check if a value is a Prisma Decimal-like object
 *
 * @param value - Value to check
 * @returns True if value is Decimal-like
 */
function isDecimalLike(value: unknown): value is DecimalLike {
    return (
        value !== null &&
        typeof value === "object" &&
        "toNumber" in value &&
        typeof (value as DecimalLike).toNumber === "function"
    );
}

/**
 * Convert a Prisma Decimal to a JavaScript number
 *
 * Handles null/undefined values by returning 0.
 * If the value is already a number, it's returned as-is.
 * If the value is a Decimal-like object (has toNumber method), it's converted.
 *
 * @param value - Prisma Decimal, number, null, or undefined
 * @returns JavaScript number (0 if null/undefined)
 *
 * @example
 * ```typescript
 * const balance = toNumber(session.current_balance); // Decimal -> number
 * const quantity = toNumber(position.quantity_lots); // Decimal -> number
 * const nullValue = toNumber(null); // 0
 * ```
 */
export function toNumber(value: unknown): number {
    if (value === null || value === undefined) {
        return 0;
    }
    if (typeof value === "number") {
        return value;
    }
    if (isDecimalLike(value)) {
        return value.toNumber();
    }
    // Fallback: try to convert to number (handles strings)
    const num = Number(value);
    return isNaN(num) ? 0 : num;
}

/**
 * Convert a Prisma Decimal to a JavaScript number, returning null if input is null/undefined
 *
 * Unlike toNumber, this function preserves null/undefined as null.
 * Useful when you need to distinguish between 0 and "no value".
 *
 * @param value - Prisma Decimal, number, null, or undefined
 * @returns JavaScript number or null
 *
 * @example
 * ```typescript
 * const exitPrice = toNumberOrNull(position.exit_price); // null if not closed
 * ```
 */
export function toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined) {
        return null;
    }
    return toNumber(value);
}
