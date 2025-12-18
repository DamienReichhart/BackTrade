/**
 * Position Repository
 *
 * Data access layer for trading Position model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    Position,
    PositionWhereInput,
    PositionCreateInput,
    PositionUpdateInput,
} from "@backtrade/types";
import { prisma } from "../libs/prisma";

/**
 * Get all positions matching optional filter conditions
 */
async function getAllPositions(
    where?: PositionWhereInput
): Promise<Position[]> {
    return prisma.position.findMany({
        where: where as Prisma.PositionWhereInput,
    }) as unknown as Position[];
}

/**
 * Get a position by ID
 */
async function getPositionById(id: number | string): Promise<Position | null> {
    return prisma.position.findUnique({
        where: { id: Number(id) },
    }) as unknown as Position | null;
}

/**
 * Create a new position
 */
async function createPosition(data: PositionCreateInput): Promise<Position> {
    return prisma.position.create({
        data: data as Prisma.PositionCreateInput,
    }) as unknown as Position;
}

/**
 * Update an existing position
 */
async function updatePosition(
    id: number | string,
    data: PositionUpdateInput
): Promise<Position> {
    return prisma.position.update({
        where: { id: Number(id) },
        data: data as Prisma.PositionUpdateInput,
    }) as unknown as Position;
}

/**
 * Delete a position by ID
 */
async function deletePosition(id: number | string): Promise<Position> {
    return prisma.position.delete({
        where: { id: Number(id) },
    }) as unknown as Position;
}

export default {
    getAllPositions,
    getPositionById,
    createPosition,
    updatePosition,
    deletePosition,
};
