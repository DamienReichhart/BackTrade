/**
 * Instrument Repository
 *
 * Data access layer for trading Instrument model operations.
 */

import type { Instrument, Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all instruments matching optional filter conditions
 */
export async function getAllInstruments(
    where?: Prisma.InstrumentWhereInput,
): Promise<Instrument[]> {
    return prisma.instrument.findMany({ where });
}

/**
 * Get an instrument by ID
 */
export async function getInstrumentById(id: number | string): Promise<Instrument | null> {
    return prisma.instrument.findUnique({
        where: { id: Number(id) },
    });
}

/**
 * Create a new instrument
 */
export async function createInstrument(data: Prisma.InstrumentCreateInput): Promise<Instrument> {
    return prisma.instrument.create({ data });
}

/**
 * Update an existing instrument
 */
export async function updateInstrument(
    id: number | string,
    data: Prisma.InstrumentUpdateInput,
): Promise<Instrument> {
    return prisma.instrument.update({
        where: { id: Number(id) },
        data,
    });
}

/**
 * Delete an instrument by ID
 */
export async function deleteInstrument(id: number | string): Promise<Instrument> {
    return prisma.instrument.delete({
        where: { id: Number(id) },
    });
}
