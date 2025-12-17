import {
    type Candle,
    type Prisma,
    type Timeframe,
    candlesRepo as candlesRepository,
} from "@backtrade/datas";
import candlesCacheService from "../cache/candles-cache-service";
import NotFoundError from "../../errors/web/not-found-error";
import type { DateRange, SearchQuery } from "@backtrade/types";
import { logger } from "../../libs/pino";

/**
 * Candles Service
 *
 * Handles business logic for candle operations including CRUD and caching.
 */
class CandlesService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "candle-service",
        });
    }

    /**
     * Get a candle by ID with caching
     *
     * @param id - Candle ID
     * @returns Candle entity
     * @throws NotFoundError if candle doesn't exist
     */
    async getCandleById(id: string): Promise<Candle> {
        const numericId = Number(id);
        const cachedCandle =
            await candlesCacheService.getCachedCandle(numericId);
        if (cachedCandle) {
            this.logger.trace({ id }, "Candle found in cache");
            return cachedCandle;
        }
        this.logger.trace(
            { id },
            "Candle not found in cache, fetching from database"
        );
        const candle = await candlesRepository.getCandleById(id);
        if (!candle) {
            this.logger.debug(
                { id },
                "Candle not found, throwing not found error"
            );
            throw new NotFoundError("Candle not found");
        }
        await candlesCacheService.cacheCandle(numericId, candle);
        this.logger.trace({ id }, "Candle cached");
        return candle;
    }

    /**
     * Get candles by instrument, timeframe, and date range
     *
     * @param instrumentId - Instrument ID
     * @param timeframe - Timeframe for candles
     * @param dateRange - Date range for filtering
     * @returns Array of candle entities
     */
    async getCandlesByInstrumentTimeframeDateRange(
        instrumentId: string,
        timeframe: Timeframe,
        dateRange: DateRange
    ): Promise<Candle[]> {
        const { startDate, endDate } = dateRange;
        const candles = await candlesRepository.getAllCandles({
            where: {
                instrument_id: Number(instrumentId),
                timeframe,
                ts: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        return candles;
    }

    /**
     * Get all candles with optional search and pagination
     *
     * @param query - Optional search query with pagination and sorting
     * @returns Array of candle entities
     */
    async getAllCandles(query?: SearchQuery): Promise<Candle[]> {
        const { q, page = 1, limit = 20, sort, order = "desc" } = query ?? {};

        const where: Prisma.CandleWhereInput | undefined = q
            ? {
                  OR: [{ instrument_id: { equals: Number(q) || undefined } }],
              }
            : undefined;

        const orderBy: Prisma.CandleOrderByWithRelationInput | undefined = sort
            ? { [sort]: order }
            : undefined;

        return candlesRepository.getAllCandles({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy,
        });
    }

    /**
     * Create a new candle
     *
     * @param candle - Candle creation data
     * @returns Created candle entity
     */
    async createCandle(candle: Prisma.CandleCreateInput): Promise<Candle> {
        const created = await candlesRepository.createCandle(candle);
        this.logger.debug({ id: created.id }, "Candle created");
        await candlesCacheService.cacheCandle(created.id, created);
        this.logger.trace({ id: created.id }, "Candle cached");
        return created;
    }

    /**
     * Delete a candle
     *
     * @param id - Candle ID
     * @returns Deleted candle entity
     * @throws NotFoundError if candle doesn't exist
     */
    async deleteCandle(id: string): Promise<Candle> {
        const existing = await candlesRepository.getCandleById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Candle not found, throwing not found error"
            );
            throw new NotFoundError("Candle not found");
        }
        const deleted = await candlesRepository.deleteCandle(id);
        this.logger.debug({ id }, "Candle deleted");
        const numericId = Number(id);
        await candlesCacheService.invalidateCachedCandle(numericId);
        this.logger.trace({ id }, "Candle invalidated from cache");
        return deleted;
    }
}

export default new CandlesService();
