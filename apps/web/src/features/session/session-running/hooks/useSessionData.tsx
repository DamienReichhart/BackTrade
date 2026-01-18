import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "../../../../api/hooks/requests/sessions";
import { useInstrument } from "../../../../api/hooks/requests/instruments";
import { useCandlesBySession } from "../../../../api/hooks/requests/candles";
import type { Candle } from "@backtrade/types";
import {
    useCurrentSessionStore,
    useCurrentPriceStore,
    useCurrentSessionCandlesStore,
} from "../../../../store/session";
import { useChartSettingsStore } from "../../../../store/chart";

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
    // Only use actual instrument_id when session is loaded and valid
    // Use empty string as placeholder to prevent invalid API calls
    const instrumentId = hasValidSession ? String(session.instrument_id) : "";
    const { data: instrument } = useInstrument(instrumentId);

    // Fetch chart candles for the session on the configured timeframe
    // The backend returns the last 2000 candles for the session
    const { data: chartCandles } = useCandlesBySession(id, timeframe);

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
