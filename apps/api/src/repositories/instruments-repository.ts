/**
 * Instrument Repository
 *
 * Data access layer for trading Instrument model operations.
 */

import type { Instrument, Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

export interface FindAllOptions {
    where?: Prisma.InstrumentWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.InstrumentOrderByWithRelationInput;
}

/**
 * Get all instruments matching optional filter, pagination, and sorting
 */
async function getAllInstruments(
    options?: FindAllOptions
): Promise<Instrument[]> {
    return prisma.instrument.findMany({
        where: options?.where,
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy,
    });
}

/**
 * Get an instrument by ID
 */
async function getInstrumentById(
    id: number | string
): Promise<Instrument | null> {
    return prisma.instrument.findUnique({
        where: { id: Number(id) },
    });
}

/**
 * Create a new instrument
 */
async function createInstrument(
    data: Prisma.InstrumentCreateInput
): Promise<Instrument> {
    return prisma.instrument.create({ data });
}

/**
 * Update an existing instrument
 */
async function updateInstrument(
    id: number | string,
    data: Prisma.InstrumentUpdateInput
): Promise<Instrument> {
    return prisma.instrument.update({
        where: { id: Number(id) },
        data,
    });
}

/**
 * Delete an instrument by ID
 */
async function deleteInstrument(id: number | string): Promise<Instrument> {
    return prisma.instrument.delete({
        where: { id: Number(id) },
    });
}

export default {
    getAllInstruments,
    getInstrumentById,
    createInstrument,
    updateInstrument,
    deleteInstrument,
};
