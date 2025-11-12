import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "../../../../api/hooks/requests/sessions";
import { useInstrument } from "../../../../api/hooks/requests/instruments";
import { useCandlesByInstrument } from "../../../../api/hooks/requests/candles";
import type { Candle, DateRangeQuery, Timeframe } from "@backtrade/types";
import { useCurrentSessionStore } from "../../../../context/CurrentSessionContext";
import { useCurrentPriceStore } from "../../../../context/CurrentPriceContext";
import { useCurrentSessionCandlesStore } from "../../../../context/CurrentSessionCandlesContext";
import { calculateCandleDateRange } from "../../../../utils/time";
import { getChartGridSettings } from "../../../../utils/localStorage";

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

  const { data: session } = useSession(id);
  const hasValidSession = !!session && !!session.instrument_id;
  const instrumentId = hasValidSession ? String(session.instrument_id) : "0";
  const { data: instrument } = useInstrument(instrumentId, {
    enabled: hasValidSession,
  });

  // Get timeframe from chart config (stored in localStorage)
  // Use state to track changes and trigger re-fetch when timeframe changes
  const [timeframe, setTimeframe] = useState(
    () => getChartGridSettings().timeframe,
  );

  // Listen for timeframe changes from chart settings
  useEffect(() => {
    const handleTimeframeChange = (
      event: CustomEvent<{ timeframe: Timeframe }>,
    ) => {
      setTimeframe(event.detail.timeframe);
    };

    window.addEventListener(
      "chartTimeframeChanged",
      handleTimeframeChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "chartTimeframeChanged",
        handleTimeframeChange as EventListener,
      );
    };
  });

  // Fetch chart candles (last 1000 candles on the configured timeframe)
  const chartDateRange = useMemo(() => {
    if (!session) return undefined;
    return calculateCandleDateRange(timeframe, session.current_ts, 1000);
  }, [session, timeframe]);

  const { data: chartCandles } = useCandlesByInstrument(
    instrumentId,
    timeframe,
    chartDateRange as DateRangeQuery | undefined,
    hasValidSession && !!session && !!chartDateRange,
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
  };
}
