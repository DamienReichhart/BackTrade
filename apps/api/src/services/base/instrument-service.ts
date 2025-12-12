import type { Instrument, Prisma } from "../../generated/prisma/client";
import instrumentsRepository from "../../repositories/instruments-repository";
import NotFoundError from "../../errors/web/not-found-error";
import type { SearchQuery } from "@backtrade/types";

const getInstrumentById = async (id: string): Promise<Instrument> => {
    const instrument = await instrumentsRepository.getInstrumentById(id);
    if (!instrument) {
        throw new NotFoundError("Instrument not found");
    }
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
    return created;
};

const updateInstrument = async (
    id: string,
    instrument: Prisma.InstrumentUpdateInput
): Promise<Instrument> => {
    const existing = await instrumentsRepository.getInstrumentById(id);
    if (!existing) {
        throw new NotFoundError("Instrument not found");
    }
    return instrumentsRepository.updateInstrument(id, instrument);
};

const deleteInstrument = async (id: string): Promise<void> => {
    const existing = await instrumentsRepository.getInstrumentById(id);
    if (!existing) {
        throw new NotFoundError("Instrument not found");
    }
    await instrumentsRepository.deleteInstrument(id);
};

export default {
    getInstrumentById,
    getAllInstruments,
    createInstrument,
    updateInstrument,
    deleteInstrument,
};
