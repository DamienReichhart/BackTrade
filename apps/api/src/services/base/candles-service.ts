import type { Candle, Prisma, Timeframe } from "../../generated/prisma/client";
import candlesRepository from "../../repositories/candles-repository";
import candlesCacheService from "../cache/candles-cache-service";
import NotFoundError from "../../errors/web/not-found-error";
import type { DateRange, SearchQuery } from "@backtrade/types";
import { logger } from "../../libs/logger/pino";

const candleServiceLogger = logger.child({
    service: "candle-service",
});

const getCandleById = async (id: string): Promise<Candle> => {
    const numericId = Number(id);
    const cachedCandle = await candlesCacheService.getCachedCandle(numericId);
    if (cachedCandle) {
        candleServiceLogger.trace({ id }, "Candle found in cache");
        return cachedCandle;
    }
    candleServiceLogger.trace(
        { id },
        "Candle not found in cache, fetching from database"
    );
    const candle = await candlesRepository.getCandleById(id);
    if (!candle) {
        candleServiceLogger.debug(
            { id },
            "Candle not found, throwing not found error"
        );
        throw new NotFoundError("Candle not found");
    }
    await candlesCacheService.cacheCandle(numericId, candle);
    candleServiceLogger.trace({ id }, "Candle cached");
    return candle;
};

const getCandlesByInstrumentTimeframeDateRange = async (
    instrumentId: string,
    timeframe: Timeframe,
    dateRange: DateRange
): Promise<Candle[]> => {
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
};

const getAllCandles = async (query?: SearchQuery): Promise<Candle[]> => {
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
};

const createCandle = async (
    candle: Prisma.CandleCreateInput
): Promise<Candle> => {
    const created = await candlesRepository.createCandle(candle);
    candleServiceLogger.debug({ id: created.id }, "Candle created");
    await candlesCacheService.cacheCandle(created.id, created);
    candleServiceLogger.trace({ id: created.id }, "Candle cached");
    return created;
};

const deleteCandle = async (id: string): Promise<Candle> => {
    const existing = await candlesRepository.getCandleById(id);
    if (!existing) {
        candleServiceLogger.debug(
            { id },
            "Candle not found, throwing not found error"
        );
        throw new NotFoundError("Candle not found");
    }
    const deleted = await candlesRepository.deleteCandle(id);
    candleServiceLogger.debug({ id }, "Candle deleted");
    const numericId = Number(id);
    await candlesCacheService.invalidateCachedCandle(numericId);
    candleServiceLogger.trace({ id }, "Candle invalidated from cache");
    return deleted;
};

export default {
    getCandleById,
    getAllCandles,
    createCandle,
    deleteCandle,
    getCandlesByInstrumentTimeframeDateRange,
};
