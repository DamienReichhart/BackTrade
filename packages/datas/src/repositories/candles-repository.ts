/**
 * Candle Repository
 *
 * Data access layer for Candle (market data) model operations.
 */

import type { Candle, Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

export interface FindAllOptions {
    where?: Prisma.CandleWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.CandleOrderByWithRelationInput;
}

/**
 * Get all candles matching optional filter, pagination, and sorting
 */
async function getAllCandles(options?: FindAllOptions): Promise<Candle[]> {
    return prisma.candle.findMany({
        where: options?.where,
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy,
    });
}

/**
 * Get a candle by ID
 */
async function getCandleById(id: number | string): Promise<Candle | null> {
    return prisma.candle.findUnique({
        where: { id: Number(id) },
    });
}

/**
 * Create a new candle
 */
async function createCandle(data: Prisma.CandleCreateInput): Promise<Candle> {
    return prisma.candle.create({ data });
}

/**
 * Update an existing candle
 */
async function updateCandle(
    id: number | string,
    data: Prisma.CandleUpdateInput
): Promise<Candle> {
    return prisma.candle.update({
        where: { id: Number(id) },
        data,
    });
}

/**
 * Delete a candle by ID
 */
async function deleteCandle(id: number | string): Promise<Candle> {
    return prisma.candle.delete({
        where: { id: Number(id) },
    });
}

export default {
    getAllCandles,
    getCandleById,
    createCandle,
    updateCandle,
    deleteCandle,
};
