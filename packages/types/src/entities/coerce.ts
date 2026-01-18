import { z } from "zod";

/**
 * Zod coercion utilities for handling database type conversions.
 *
 * These utilities handle the conversion of various database types (Prisma Decimal,
 * ClickHouse Decimal64, etc.) back to JavaScript numbers for frontend consumption.
 */

/**
 * Coerce value to number, handling Decimal objects, strings, and numbers.
 *
 * Database Decimal types (Prisma Decimal, ClickHouse Decimal64) are often
 * serialized as strings by JSON.stringify(). This coercion schema converts
 * them back to numbers for frontend consumption.
 *
 * @example
 * ```ts
 * const schema = z.object({
 *     price: numberCoerce.positive(),
 *     quantity: numberCoerce.int().nonnegative(),
 * });
 * ```
 */
export const numberCoerce = z.coerce.number();

/**
 * Nullable number coercion that properly handles null/undefined before coercing.
 *
 * This prevents NaN issues when null values are passed through z.coerce.number().
 * Use this for nullable database fields that may contain Decimal types.
 *
 * @example
 * ```ts
 * const schema = z.object({
 *     realized_pnl: nullableNumberCoerce,
 *     unrealized_pnl: nullableNumberCoerce,
 * });
 * ```
 */
export const nullableNumberCoerce = z.preprocess(
    (val) => val ?? null,
    z.coerce.number().nullable()
);
