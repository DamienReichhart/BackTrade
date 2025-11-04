import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "../../../api/requests/sessions";
import { useInstrument } from "../../../api/requests/instruments";
import { useCandlesByInstrument } from "../../../api/requests/candles";
import type { Candle, DateRangeQuery } from "@backtrade/types";
import { TopBar } from "./components/TopBar";
import { SidePanel } from "./components/SidePanel";
import { PositionsTable } from "./components/PositionsTable";
import { TransactionsTable } from "./components/TransactionsTable";
import { SessionInfo } from "./components/SessionInfo";
import { useCurrentSessionStore } from "../../../context/CurrentSessionContext";
import { useCurrentPriceStore } from "../../../context/CurrentPriceContext";
import styles from "./SessionRunning.module.css";

/**
 * Running Session page (chart replaced with an empty container for now)
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

  const { data: session } = useSession(id);
  const hasValidSession = !!session && !!session.instrument_id;
  const instrumentId = hasValidSession ? String(session.instrument_id) : "0";
  const { data: instrument } = useInstrument(instrumentId, {
    enabled: hasValidSession,
  });

  // Fetch current price from candles
  const { data: candles } = useCandlesByInstrument(
    instrumentId,
    "M1",
    session
      ? ({
          ts_lte: session.current_ts,
          ts_gte:
            new Date(new Date(session.current_ts).getTime() - 2 * 60 * 1000)
              .toISOString()
              .slice(0, 19) + "Z",
        } as DateRangeQuery)
      : undefined,
    hasValidSession && !!session,
  );

  const currentPrice = useMemo(() => {
    if (!candles || candles.length === 0) return undefined;
    const last = (candles as Candle[])[candles.length - 1];
    return last.close;
  }, [candles]);

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

  // Update the global store when current price or session timestamp changes
  useEffect(() => {
    setCurrentPrice(currentPrice);
  }, [currentPrice, session?.current_ts, setCurrentPrice]);

  // Cleanup: clear session when component unmounts
  useEffect(() => {
    return () => {
      clearCurrentSession();
    };
  }, [clearCurrentSession]);

  return (
    <div className={styles.page}>
      <TopBar />

      <div className={styles.content}>
        {/* Chart placeholder */}
        <div className={styles.chartPlaceholderWrapper}>
          <div className={styles.chartPlaceholder} />
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
