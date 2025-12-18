import { instrumentsRepo as instrumentsRepository } from "@backtrade/datas";
import type {
    Instrument,
    InstrumentWhereInput,
    InstrumentCreateInput,
    InstrumentUpdateInput,
    InstrumentOrderBy,
    SearchQuery,
} from "@backtrade/types";
import { instrumentsCacheRepo } from "../../libs/cache";
import { logger } from "../../libs/pino";
import NotFoundError from "../../errors/web/not-found-error";

/**
 * Instruments Service
 *
 * Handles business logic for instrument operations including CRUD and caching.
 */
class InstrumentsService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "instrument-service",
        });
    }

    /**
     * Get an instrument by ID with caching
     *
     * @param id - Instrument ID
     * @returns Instrument entity
     * @throws NotFoundError if instrument doesn't exist
     */
    async getInstrumentById(id: string): Promise<Instrument> {
        const numericId = Number(id);
        const cachedInstrument =
            await instrumentsCacheRepo.getCachedInstrument(numericId);
        if (cachedInstrument) {
            this.logger.trace({ id }, "Instrument found in cache");
            return cachedInstrument;
        }
        this.logger.trace(
            { id },
            "Instrument not found in cache, fetching from database"
        );
        const instrument = await instrumentsRepository.getInstrumentById(id);
        if (!instrument) {
            this.logger.debug(
                { id },
                "Instrument not found, throwing not found error"
            );
            throw new NotFoundError("Instrument not found");
        }
        await instrumentsCacheRepo.cacheInstrument(numericId, instrument);
        this.logger.trace({ id }, "Instrument cached");
        return instrument;
    }

    /**
     * Get all instruments with optional search and pagination
     *
     * @param query - Optional search query with pagination and sorting
     * @returns Array of instrument entities
     */
    async getAllInstruments(query?: SearchQuery): Promise<Instrument[]> {
        const { q, page = 1, limit = 20, sort, order = "desc" } = query ?? {};

        const where: InstrumentWhereInput | undefined = q
            ? {
                  OR: [
                      { symbol: { contains: q, mode: "insensitive" } },
                      { display_name: { contains: q, mode: "insensitive" } },
                  ],
              }
            : undefined;

        const orderBy: InstrumentOrderBy | undefined = sort
            ? { [sort]: order }
            : undefined;

        return instrumentsRepository.getAllInstruments({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy,
        });
    }

    /**
     * Create a new instrument
     *
     * @param instrument - Instrument creation data
     * @returns Created instrument entity
     */
    async createInstrument(
        instrument: InstrumentCreateInput
    ): Promise<Instrument> {
        const created =
            await instrumentsRepository.createInstrument(instrument);
        this.logger.debug({ id: created.id }, "Instrument created");
        await instrumentsCacheRepo.cacheInstrument(created.id, created);
        this.logger.trace({ id: created.id }, "Instrument cached");
        return created;
    }

    /**
     * Update an existing instrument
     *
     * @param id - Instrument ID
     * @param instrument - Instrument update data
     * @returns Updated instrument entity
     * @throws NotFoundError if instrument doesn't exist
     */
    async updateInstrument(
        id: string,
        instrument: InstrumentUpdateInput
    ): Promise<Instrument> {
        const existing = await instrumentsRepository.getInstrumentById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Instrument not found, throwing not found error"
            );
            throw new NotFoundError("Instrument not found");
        }
        const updated = await instrumentsRepository.updateInstrument(
            id,
            instrument
        );
        this.logger.debug({ id: updated.id }, "Instrument updated");
        await instrumentsCacheRepo.cacheInstrument(updated.id, updated);
        this.logger.trace({ id: updated.id }, "Instrument cached");
        return updated;
    }

    /**
     * Delete an instrument
     *
     * @param id - Instrument ID
     * @throws NotFoundError if instrument doesn't exist
     */
    async deleteInstrument(id: string): Promise<void> {
        const existing = await instrumentsRepository.getInstrumentById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Instrument not found, throwing not found error"
            );
            throw new NotFoundError("Instrument not found");
        }
        await instrumentsRepository.deleteInstrument(id);
        this.logger.debug({ id }, "Instrument deleted");
        const numericId = Number(id);
        await instrumentsCacheRepo.invalidateCachedInstrument(numericId);
        this.logger.trace({ id }, "Instrument invalidated from cache");
    }
}

export default new InstrumentsService();
