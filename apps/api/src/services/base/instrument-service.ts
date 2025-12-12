import type { Instrument, Prisma } from "../../generated/prisma/client";
import instrumentsRepository from "../../repositories/instruments-repository";
import instrumentsCacheService from "../cache/instruments-cache-service";
import { logger } from "../../libs/logger/pino";
import NotFoundError from "../../errors/web/not-found-error";
import type { SearchQuery } from "@backtrade/types";

const instrumentServiceLogger = logger.child({
    service: "instrument-service",
});

const getInstrumentById = async (id: string): Promise<Instrument> => {
    const numericId = Number(id);
    const cachedInstrument =
        await instrumentsCacheService.getCachedInstrument(numericId);
    if (cachedInstrument) {
        instrumentServiceLogger.trace({ id }, "Instrument found in cache");
        return cachedInstrument;
    }
    instrumentServiceLogger.trace(
        { id },
        "Instrument not found in cache, fetching from database"
    );
    const instrument = await instrumentsRepository.getInstrumentById(id);
    if (!instrument) {
        instrumentServiceLogger.debug(
            { id },
            "Instrument not found, throwing not found error"
        );
        throw new NotFoundError("Instrument not found");
    }
    await instrumentsCacheService.cacheInstrument(numericId, instrument);
    instrumentServiceLogger.trace({ id }, "Instrument cached");
    return instrument;
};

const getAllInstruments = async (
    query?: SearchQuery
): Promise<Instrument[]> => {
    const { q, page = 1, limit = 20, sort, order = "desc" } = query ?? {};

    const where: Prisma.InstrumentWhereInput | undefined = q
        ? {
              OR: [
                  { symbol: { contains: q, mode: "insensitive" } },
                  { display_name: { contains: q, mode: "insensitive" } },
              ],
          }
        : undefined;

    const orderBy: Prisma.InstrumentOrderByWithRelationInput | undefined = sort
        ? { [sort]: order }
        : undefined;

    return instrumentsRepository.getAllInstruments({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
    });
};

const createInstrument = async (
    instrument: Prisma.InstrumentCreateInput
): Promise<Instrument> => {
    const created = await instrumentsRepository.createInstrument(instrument);
    instrumentServiceLogger.debug({ id: created.id }, "Instrument created");
    await instrumentsCacheService.cacheInstrument(created.id, created);
    instrumentServiceLogger.trace({ id: created.id }, "Instrument cached");
    return created;
};

const updateInstrument = async (
    id: string,
    instrument: Prisma.InstrumentUpdateInput
): Promise<Instrument> => {
    const existing = await instrumentsRepository.getInstrumentById(id);
    if (!existing) {
        instrumentServiceLogger.debug(
            { id },
            "Instrument not found, throwing not found error"
        );
        throw new NotFoundError("Instrument not found");
    }
    const updated = await instrumentsRepository.updateInstrument(
        id,
        instrument
    );
    instrumentServiceLogger.debug({ id: updated.id }, "Instrument updated");
    await instrumentsCacheService.cacheInstrument(updated.id, updated);
    instrumentServiceLogger.trace({ id: updated.id }, "Instrument cached");
    return updated;
};

const deleteInstrument = async (id: string): Promise<void> => {
    const existing = await instrumentsRepository.getInstrumentById(id);
    if (!existing) {
        instrumentServiceLogger.debug(
            { id },
            "Instrument not found, throwing not found error"
        );
        throw new NotFoundError("Instrument not found");
    }
    await instrumentsRepository.deleteInstrument(id);
    instrumentServiceLogger.debug({ id }, "Instrument deleted");
    const numericId = Number(id);
    await instrumentsCacheService.invalidateCachedInstrument(numericId);
    instrumentServiceLogger.trace({ id }, "Instrument invalidated from cache");
};

export default {
    getInstrumentById,
    getAllInstruments,
    createInstrument,
    updateInstrument,
    deleteInstrument,
};
