import { useGet } from "..";
import {
    CandleListResponseSchema,
    type DateRangeQuery,
} from "@backtrade/types";
import {
    buildUrlWithParams,
    buildUrlWithAdditionalParams,
} from "../utils/url-params";

/**
 * Candle Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useCandles(query?: DateRangeQuery) {
    const url = buildUrlWithParams("/candles", query);
    return useGet(url, CandleListResponseSchema);
}

export function useCandlesByInstrument(
    instrumentId: string,
    timeframe: string,
    query?: DateRangeQuery
) {
    const url = buildUrlWithAdditionalParams(
        `/instruments/${instrumentId}/candles`,
        { timeframe },
        query
    );

    // Validate that instrumentId is not empty, not "0", and is a valid positive number
    const isValidInstrumentId =
        !!instrumentId &&
        instrumentId !== "0" &&
        !isNaN(Number(instrumentId)) &&
        Number(instrumentId) > 0;

    return useGet(url, CandleListResponseSchema, {
        enabled: isValidInstrumentId && !!timeframe,
    });
}

export function useCandlesByDataset(datasetId: string, query?: DateRangeQuery) {
    const url = buildUrlWithParams(`/datasets/${datasetId}/candles`, query);
    return useGet(url, CandleListResponseSchema, { enabled: !!datasetId });
}

export function useCandlesBySession(id: string, timeframe: string) {
    const url = buildUrlWithAdditionalParams(`/sessions/${id}/candles`, {
        timeframe,
    });

    // Validate that session id is not empty and timeframe is provided
    const isValidSessionId =
        !!id && id !== "0" && !isNaN(Number(id)) && Number(id) > 0;

    return useGet(url, CandleListResponseSchema, {
        enabled: isValidSessionId && !!timeframe,
    });
}
