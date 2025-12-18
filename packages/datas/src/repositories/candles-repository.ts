/**
 * Candle Repository
 *
 * Data access layer for Candle (market data) model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    Candle,
    CandleWhereInput,
    CandleCreateInput,
    CandleUpdateInput,
    CandleOrderBy,
} from "@backtrade/types";
import { prisma } from "../libs/prisma";

export interface FindAllOptions {
    where?: CandleWhereInput;
    skip?: number;
    take?: number;
    orderBy?: CandleOrderBy;
}

/**
 * Get all candles matching optional filter, pagination, and sorting
 */
async function getAllCandles(options?: FindAllOptions): Promise<Candle[]> {
    return prisma.candle.findMany({
        where: options?.where as Prisma.CandleWhereInput | undefined,
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy as
            | Prisma.CandleOrderByWithRelationInput
            | undefined,
    }) as unknown as Candle[];
}

/**
 * Get a candle by ID
 */
async function getCandleById(id: number | string): Promise<Candle | null> {
    return prisma.candle.findUnique({
        where: { id: Number(id) },
    }) as unknown as Candle | null;
}

/**
 * Create a new candle
 */
async function createCandle(data: CandleCreateInput): Promise<Candle> {
    return prisma.candle.create({
        data: data as Prisma.CandleCreateInput,
    }) as unknown as Candle;
}

/**
 * Update an existing candle
 */
async function updateCandle(
    id: number | string,
    data: CandleUpdateInput
): Promise<Candle> {
    return prisma.candle.update({
        where: { id: Number(id) },
        data: data as Prisma.CandleUpdateInput,
    }) as unknown as Candle;
}

/**
 * Delete a candle by ID
 */
async function deleteCandle(id: number | string): Promise<Candle> {
    return prisma.candle.delete({
        where: { id: Number(id) },
    }) as unknown as Candle;
}

export default {
    getAllCandles,
    getCandleById,
    createCandle,
    updateCandle,
    deleteCandle,
};
