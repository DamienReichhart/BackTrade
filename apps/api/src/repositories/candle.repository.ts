/**
 * Candle Repository
 *
 * Data access layer for Candle (market data) model operations.
 */

import type { Candle, Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all candles matching optional filter conditions
 */
export async function getAllCandles(where?: Prisma.CandleWhereInput): Promise<Candle[]> {
    return prisma.candle.findMany({ where });
}

/**
 * Get a candle by ID
 */
export async function getCandleById(id: number | string): Promise<Candle | null> {
    return prisma.candle.findUnique({
        where: { id: Number(id) },
    });
}

/**
 * Create a new candle
 */
export async function createCandle(data: Prisma.CandleCreateInput): Promise<Candle> {
    return prisma.candle.create({ data });
}

/**
 * Update an existing candle
 */
export async function updateCandle(
    id: number | string,
    data: Prisma.CandleUpdateInput,
): Promise<Candle> {
    return prisma.candle.update({
        where: { id: Number(id) },
        data,
    });
}

/**
 * Delete a candle by ID
 */
export async function deleteCandle(id: number | string): Promise<Candle> {
    return prisma.candle.delete({
        where: { id: Number(id) },
    });
}
