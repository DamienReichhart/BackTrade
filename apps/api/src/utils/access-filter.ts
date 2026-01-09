/**
 * Access Filter Utilities
 *
 * Generic utilities for filtering entities by access rights.
 * Eliminates duplication of access filtering logic across services.
 */

import type { ServiceLogger } from "../services/base/base-service";

/**
 * Result of filtering entities by access
 */
export interface AccessFilterResult<T> {
    /** Entities the user has access to */
    accessible: T[];
    /** Count of entities filtered out due to access denial */
    filteredCount: number;
}

/**
 * Filter entities by access rights in parallel
 *
 * Verifies access for each entity using the provided access checker function,
 * executing checks in parallel for performance. Logs access filtering statistics
 * for security auditing.
 *
 * @template T - Entity type
 * @param entities - Array of entities to filter
 * @param accessChecker - Async function that returns true if access is allowed
 * @param logger - Logger instance for audit logging
 * @param context - Additional context for logging (userId, userRole, entityType)
 * @returns Object containing accessible entities and count of filtered entities
 *
 * @example
 * ```typescript
 * const result = await filterByAccess(
 *     positions,
 *     (position) => this.verifyPositionAccess(position, user),
 *     this.logger,
 *     { userId: user.id, userRole: user.role, entityType: "Position" }
 * );
 * return result.accessible;
 * ```
 */
export async function filterByAccess<T>(
    entities: T[],
    accessChecker: (entity: T) => Promise<boolean>,
    logger: ServiceLogger,
    context: { userId: number; userRole: string; entityType: string }
): Promise<AccessFilterResult<T>> {
    if (entities.length === 0) {
        return { accessible: [], filteredCount: 0 };
    }

    // Verify access for all entities in parallel
    const accessResults = await Promise.all(entities.map(accessChecker));

    // Filter entities based on access results
    const accessible: T[] = [];
    let filteredCount = 0;

    entities.forEach((entity, index) => {
        if (accessResults[index]) {
            accessible.push(entity);
        } else {
            filteredCount++;
        }
    });

    // Log if any entities were filtered out
    if (filteredCount > 0) {
        logger.debug(
            {
                userId: context.userId,
                userRole: context.userRole,
                entityType: context.entityType,
                totalCount: entities.length,
                filteredCount,
                accessibleCount: accessible.length,
            },
            `${context.entityType}s filtered by access rights`
        );
    }

    return { accessible, filteredCount };
}

/**
 * Synchronous version of filterByAccess for simple access checks
 *
 * Use this when the access check doesn't require async operations.
 *
 * @template T - Entity type
 * @param entities - Array of entities to filter
 * @param accessChecker - Sync function that returns true if access is allowed
 * @param logger - Logger instance for audit logging
 * @param context - Additional context for logging
 * @returns Object containing accessible entities and count of filtered entities
 */
export function filterByAccessSync<T>(
    entities: T[],
    accessChecker: (entity: T) => boolean,
    logger: ServiceLogger,
    context: { userId: number; userRole: string; entityType: string }
): AccessFilterResult<T> {
    if (entities.length === 0) {
        return { accessible: [], filteredCount: 0 };
    }

    const accessible: T[] = [];
    let filteredCount = 0;

    for (const entity of entities) {
        if (accessChecker(entity)) {
            accessible.push(entity);
        } else {
            filteredCount++;
        }
    }

    // Log if any entities were filtered out
    if (filteredCount > 0) {
        logger.debug(
            {
                userId: context.userId,
                userRole: context.userRole,
                entityType: context.entityType,
                totalCount: entities.length,
                filteredCount,
                accessibleCount: accessible.length,
            },
            `${context.entityType}s filtered by access rights`
        );
    }

    return { accessible, filteredCount };
}
