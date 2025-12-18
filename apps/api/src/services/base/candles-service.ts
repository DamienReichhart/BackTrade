import { candlesRepo as candlesRepository } from "@backtrade/datas";
import type {
    Candle,
    CandleWhereInput,
    CandleCreateInput,
    CandleOrderBy,
    Timeframe,
    DateRange,
    SearchQuery,
} from "@backtrade/types";
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
                instrument_id: { equals: Number(instrumentId) },
                timeframe: { equals: timeframe },
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

        // Validate and parse numeric search query for instrument_id
        // If q is provided but not numeric, return no results (invalid search)
        const numericQ = q ? Number(q) : undefined;
        const isValidNumericQ =
            numericQ !== undefined && Number.isFinite(numericQ);
        const where: CandleWhereInput | undefined = q
            ? isValidNumericQ
                ? {
                      OR: [{ instrument_id: { equals: numericQ } }],
                  }
                : {
                      // Invalid search query - return no results by using impossible condition
                      AND: [{ instrument_id: { equals: -1 } }],
                  }
            : undefined;

        // Validate sort parameter against valid Candle fields
        const validCandleSortFields = [
            "instrument_id",
            "timeframe",
            "ts",
            "open",
            "high",
            "low",
            "close",
            "volume",
            "created_at",
            "updated_at",
        ] as const;
        const orderBy: CandleOrderBy | undefined =
            sort &&
            validCandleSortFields.includes(
                sort as (typeof validCandleSortFields)[number]
            )
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
    async createCandle(candle: CandleCreateInput): Promise<Candle> {
        const created = await candlesRepository.createCandle(candle);
        this.logger.debug(
            {
                instrument_id: created.instrument_id,
                timeframe: created.timeframe,
                ts: created.ts,
            },
            "Candle created"
        );
        return created;
    }

    /**
     * Delete a candle
     *
     * @param id - Candle ID
     * @returns Deleted candle entity
     * @throws NotFoundError if candle doesn't exist
     */
    // NOTE: Delete by numeric ID has been removed because
    // candles no longer have a standalone ID. Deletion should be
    // implemented using the composite key (instrument_id, timeframe, ts)
    // when the corresponding route is introduced.
}

export default new CandlesService();
