/**
 * Query Builder Utilities
 *
 * Shared utilities for building database query parameters.
 * These functions eliminate code duplication across services.
 */

/**
 * Build an order by clause for database queries
 *
 * Validates that the sort field is in the list of valid fields before
 * constructing the order by object. Returns undefined if the sort field
 * is invalid or not provided.
 *
 * @template T - String literal union type of valid sort fields
 * @param sort - The field name to sort by
 * @param order - Sort direction ("asc" or "desc")
 * @param validFields - Readonly array of valid field names
 * @returns Order by clause object or undefined if sort field is invalid
 *
 * @example
 * ```typescript
 * const VALID_FIELDS = ["id", "name", "created_at"] as const;
 * const orderBy = buildOrderBy("name", "asc", VALID_FIELDS);
 * // Returns: { name: "asc" }
 * ```
 */
export function buildOrderBy<T extends string>(
    sort: string | undefined,
    order: "asc" | "desc",
    validFields: readonly T[]
): Record<T, "asc" | "desc"> | undefined {
    if (!sort || !validFields.includes(sort as T)) {
        return undefined;
    }
    return { [sort]: order } as Record<T, "asc" | "desc">;
}

/**
 * Build pagination parameters for database queries
 *
 * Converts page number and limit to skip/take format used by Prisma.
 * Uses sensible defaults: page 1 and limit 20.
 *
 * @param page - Page number (1-indexed, defaults to 1)
 * @param limit - Number of items per page (defaults to 20)
 * @returns Object with skip and take properties for Prisma queries
 *
 * @example
 * ```typescript
 * const pagination = buildPagination(2, 10);
 * // Returns: { skip: 10, take: 10 }
 * ```
 */
export function buildPagination(
    page: number = 1,
    limit: number = 20
): { skip: number; take: number } {
    return {
        skip: (page - 1) * limit,
        take: limit,
    };
}
