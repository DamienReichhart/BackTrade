/**
 * Instrument Repository
 *
 * Data access layer for trading Instrument model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    Instrument,
    InstrumentWhereInput,
    InstrumentCreateInput,
    InstrumentUpdateInput,
    InstrumentOrderBy,
} from "@backtrade/types";
import { BaseRepository } from "./base-repository";

export interface FindAllOptions {
    where?: InstrumentWhereInput;
    skip?: number;
    take?: number;
    orderBy?: InstrumentOrderBy;
}

/**
 * Repository for Instrument model CRUD operations with pagination and sorting.
 */
class InstrumentsRepository extends BaseRepository {
    /**
     * Get all instruments matching optional filter, pagination, and sorting.
     *
     * @param options - Optional filter, pagination, and sorting options
     * @returns Array of matching instruments
     */
    async getAllInstruments(options?: FindAllOptions): Promise<Instrument[]> {
        return this.prisma.instrument.findMany({
            where: options?.where as Prisma.InstrumentWhereInput | undefined,
            skip: options?.skip,
            take: options?.take,
            orderBy: options?.orderBy as
                | Prisma.InstrumentOrderByWithRelationInput
                | undefined,
        }) as unknown as Instrument[];
    }

    /**
     * Get an instrument by ID.
     *
     * @param id - Instrument ID as number or string
     * @returns Instrument entity or null if not found
     */
    async getInstrumentById(id: number | string): Promise<Instrument | null> {
        return this.prisma.instrument.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as Instrument | null;
    }

    /**
     * Create a new instrument.
     *
     * @param data - Instrument creation data
     * @returns Created instrument entity
     */
    async createInstrument(data: InstrumentCreateInput): Promise<Instrument> {
        return this.prisma.instrument.create({
            data: data as Prisma.InstrumentCreateInput,
        }) as unknown as Instrument;
    }

    /**
     * Update an existing instrument.
     *
     * @param id - Instrument ID as number or string
     * @param data - Instrument update data
     * @returns Updated instrument entity
     */
    async updateInstrument(
        id: number | string,
        data: InstrumentUpdateInput
    ): Promise<Instrument> {
        return this.prisma.instrument.update({
            where: { id: this.toNumericId(id) },
            data: data as Prisma.InstrumentUpdateInput,
        }) as unknown as Instrument;
    }

    /**
     * Delete an instrument by ID.
     *
     * @param id - Instrument ID as number or string
     * @returns Deleted instrument entity
     */
    async deleteInstrument(id: number | string): Promise<Instrument> {
        return this.prisma.instrument.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as Instrument;
    }
}

const instrumentsRepo = new InstrumentsRepository();

export default instrumentsRepo;
