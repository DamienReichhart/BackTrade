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
import { prisma } from "../libs/prisma";

export interface FindAllOptions {
    where?: InstrumentWhereInput;
    skip?: number;
    take?: number;
    orderBy?: InstrumentOrderBy;
}

/**
 * Get all instruments matching optional filter, pagination, and sorting
 */
async function getAllInstruments(
    options?: FindAllOptions
): Promise<Instrument[]> {
    return prisma.instrument.findMany({
        where: options?.where as Prisma.InstrumentWhereInput | undefined,
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy as
            | Prisma.InstrumentOrderByWithRelationInput
            | undefined,
    }) as unknown as Instrument[];
}

/**
 * Get an instrument by ID
 */
async function getInstrumentById(
    id: number | string
): Promise<Instrument | null> {
    return prisma.instrument.findUnique({
        where: { id: Number(id) },
    }) as unknown as Instrument | null;
}

/**
 * Create a new instrument
 */
async function createInstrument(
    data: InstrumentCreateInput
): Promise<Instrument> {
    return prisma.instrument.create({
        data: data as Prisma.InstrumentCreateInput,
    }) as unknown as Instrument;
}

/**
 * Update an existing instrument
 */
async function updateInstrument(
    id: number | string,
    data: InstrumentUpdateInput
): Promise<Instrument> {
    return prisma.instrument.update({
        where: { id: Number(id) },
        data: data as Prisma.InstrumentUpdateInput,
    }) as unknown as Instrument;
}

/**
 * Delete an instrument by ID
 */
async function deleteInstrument(id: number | string): Promise<Instrument> {
    return prisma.instrument.delete({
        where: { id: Number(id) },
    }) as unknown as Instrument;
}

export default {
    getAllInstruments,
    getInstrumentById,
    createInstrument,
    updateInstrument,
    deleteInstrument,
};
