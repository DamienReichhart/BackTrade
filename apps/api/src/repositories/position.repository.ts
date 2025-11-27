/**
 * Position Repository
 *
 * Data access layer for trading Position model operations.
 */

import type { Position, Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all positions matching optional filter conditions
 */
export async function getAllPositions(where?: Prisma.PositionWhereInput): Promise<Position[]> {
    return prisma.position.findMany({ where });
}

/**
 * Get a position by ID
 */
export async function getPositionById(id: number | string): Promise<Position | null> {
    return prisma.position.findUnique({
        where: { id: Number(id) },
    });
}

/**
 * Create a new position
 */
export async function createPosition(data: Prisma.PositionCreateInput): Promise<Position> {
    return prisma.position.create({ data });
}

/**
 * Update an existing position
 */
export async function updatePosition(
    id: number | string,
    data: Prisma.PositionUpdateInput,
): Promise<Position> {
    return prisma.position.update({
        where: { id: Number(id) },
        data,
    });
}

/**
 * Delete a position by ID
 */
export async function deletePosition(id: number | string): Promise<Position> {
    return prisma.position.delete({
        where: { id: Number(id) },
    });
}
