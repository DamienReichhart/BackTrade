import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "../../../../api/hooks/requests/sessions";
import { useInstrument } from "../../../../api/hooks/requests/instruments";
import { useCandlesByInstrument } from "../../../../api/hooks/requests/candles";
import type { Candle, DateRangeQuery } from "@backtrade/types";
import {
    useCurrentSessionStore,
    useCurrentPriceStore,
    useCurrentSessionCandlesStore,
} from "../../../../store/session";
import { useChartSettingsStore } from "../../../../store/chart";
import { calculateCandleDateRange } from "../../../../utils/data/candles";

/**
 * Hook to fetch and manage session-related data
 * Handles fetching session, instrument, and candles, and synchronizes them to global stores
 *
 * @returns Session data and loading states
 */
export function useSessionData() {
    const { id = "" } = useParams();
    const {
        setCurrentSession,
        setCurrentSessionInstrument,
        clearCurrentSession,
    } = useCurrentSessionStore();
    const { setCurrentPrice } = useCurrentPriceStore();
    const { setCandles, clearCandles } = useCurrentSessionCandlesStore();
    const timeframe = useChartSettingsStore((state) => state.timeframe);

    const { data: session, isLoading: isLoadingSession } = useSession(id);
    const hasValidSession = !!session && !!session.instrument_id;
    const instrumentId = hasValidSession ? String(session.instrument_id) : "0";
    const { data: instrument } = useInstrument(instrumentId);

    // Fetch chart candles (last 1000 candles on the configured timeframe)
    const chartDateRange = useMemo(() => {
        if (!session) return undefined;
        return calculateCandleDateRange(timeframe, session.current_time, 1000);
    }, [session, timeframe]);

    const { data: chartCandles } = useCandlesByInstrument(
        // will be changed to useCandlesBySession when implemented in backend
        instrumentId,
        timeframe,
        chartDateRange as DateRangeQuery | undefined
    );

    // Derive current price from the last candle of the chart data
    const currentPrice = useMemo(() => {
        if (!chartCandles || chartCandles.length === 0) return undefined;
        const last = (chartCandles as Candle[])[chartCandles.length - 1];
        return last.close;
    }, [chartCandles]);

    // Sync session to global store
    useEffect(() => {
        if (session) {
            setCurrentSession(session);
        } else {
            clearCurrentSession();
        }
    }, [session, setCurrentSession, clearCurrentSession]);

    // Sync instrument to global store
    useEffect(() => {
        if (instrument) {
            setCurrentSessionInstrument(instrument);
        } else {
            setCurrentSessionInstrument(undefined);
        }
    }, [instrument, setCurrentSessionInstrument]);

    // Update the global store when current price changes
    useEffect(() => {
        setCurrentPrice(currentPrice);
    }, [currentPrice, setCurrentPrice]);

    // Update chart candles in store
    useEffect(() => {
        if (chartCandles && Array.isArray(chartCandles)) {
            setCandles(chartCandles as Candle[]);
        }
    }, [chartCandles, setCandles]);

    // Cleanup: clear session and candles when component unmounts
    useEffect(() => {
        return () => {
            clearCurrentSession();
            clearCandles();
        };
    }, [clearCurrentSession, clearCandles]);

    return {
        session,
        instrument,
        chartCandles: chartCandles as Candle[] | undefined,
        currentPrice,
        hasValidSession,
        isLoading: isLoadingSession,
    };
}
