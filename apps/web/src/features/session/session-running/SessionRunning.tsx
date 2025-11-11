import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "../../../api/hooks/requests/sessions";
import { useInstrument } from "../../../api/hooks/requests/instruments";
import { useCandlesByInstrument } from "../../../api/hooks/requests/candles";
import type { Candle, DateRangeQuery } from "@backtrade/types";
import { TopBar } from "./components/TopBar";
import { SidePanel } from "./components/SidePanel";
import { PositionsTable } from "./components/PositionsTable";
import { TransactionsTable } from "./components/TransactionsTable";
import { SessionInfo } from "./components/SessionInfo";
import { RunningSessionChart } from "./components/RunningSessionChart";
import { useCurrentSessionStore } from "../../../context/CurrentSessionContext";
import { useCurrentPriceStore } from "../../../context/CurrentPriceContext";
import { useCurrentSessionCandlesStore } from "../../../context/CurrentSessionCandlesContext";
import { calculateCandleDateRange } from "../../../utils/timeConvert";
import styles from "./SessionRunning.module.css";

/**
 * Running Session page
 *
 * The layout strictly follows the mockup: header controls, main chart area,
 * order/estimates panel on the right, and tables below.
 */
export function SessionRunning() {
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

  // Fetch chart candles (last 1000 candles on the configured timeframe)
  const chartDateRange = useMemo(() => {
    if (!session) return undefined;
    return calculateCandleDateRange(
      session.timeframe,
      session.current_ts,
      1000,
    );
  }, [session]);

  const { data: chartCandles } = useCandlesByInstrument(
    instrumentId,
    session?.timeframe ?? "M1",
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

  return (
    <div className={styles.page}>
      <TopBar />

      <div className={styles.content}>
        {/* Chart */}
        <div className={styles.chartPlaceholderWrapper}>
          <RunningSessionChart />
        </div>

        {/* Order ticket */}
        <div className={styles.orderTicketWrapper}>
          <SidePanel />
        </div>

        {/* Tables */}
        <div className={styles.tablesRow}>
          <PositionsTable />
          <TransactionsTable />
        </div>

        {/* Session Info */}
        <div className={styles.sessionInfoWrapper}>
          <SessionInfo />
        </div>
      </div>
    </div>
  );
}
