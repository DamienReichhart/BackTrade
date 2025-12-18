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
import { BaseRepository } from "./base-repository";

export interface FindAllOptions {
    where?: CandleWhereInput;
    skip?: number;
    take?: number;
    orderBy?: CandleOrderBy;
}

/**
 * Repository for Candle model CRUD operations with pagination and sorting.
 */
class CandlesRepository extends BaseRepository {
    /**
     * Get all candles matching optional filter, pagination, and sorting.
     *
     * @param options - Optional filter, pagination, and sorting options
     * @returns Array of matching candles
     */
    async getAllCandles(options?: FindAllOptions): Promise<Candle[]> {
        return this.prisma.candle.findMany({
            where: options?.where as Prisma.CandleWhereInput | undefined,
            skip: options?.skip,
            take: options?.take,
            orderBy: options?.orderBy as
                | Prisma.CandleOrderByWithRelationInput
                | undefined,
        }) as unknown as Candle[];
    }

    /**
     * Get a candle by ID.
     *
     * @param id - Candle ID as number or string
     * @returns Candle entity or null if not found
     */
    async getCandleById(id: number | string): Promise<Candle | null> {
        return this.prisma.candle.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as Candle | null;
    }

    /**
     * Create a new candle.
     *
     * @param data - Candle creation data
     * @returns Created candle entity
     */
    async createCandle(data: CandleCreateInput): Promise<Candle> {
        return this.prisma.candle.create({
            data: data as Prisma.CandleCreateInput,
        }) as unknown as Candle;
    }

    /**
     * Update an existing candle.
     *
     * @param id - Candle ID as number or string
     * @param data - Candle update data
     * @returns Updated candle entity
     */
    async updateCandle(
        id: number | string,
        data: CandleUpdateInput
    ): Promise<Candle> {
        return this.prisma.candle.update({
            where: { id: this.toNumericId(id) },
            data: data as CandleUpdateInput as Prisma.CandleUpdateInput,
        }) as unknown as Candle;
    }

    /**
     * Delete a candle by ID.
     *
     * @param id - Candle ID as number or string
     * @returns Deleted candle entity
     */
    async deleteCandle(id: number | string): Promise<Candle> {
        return this.prisma.candle.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as Candle;
    }
}

const candlesRepo = new CandlesRepository();

export default candlesRepo;
