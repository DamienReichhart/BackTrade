import styles from "./SidePanel.module.css";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentPriceStore } from "../../../../../context/CurrentPriceContext";
import { useCurrentSessionStore } from "../../../../../context/CurrentSessionContext";
import { useCreatePosition } from "../../../../../api/requests/positions";
import type { CreatePositionRequest } from "@backtrade/types";

/**
 * Right-side panel with order ticket and session KPIs as per mockup.
 */
export function SidePanel() {
  const currency = "€";
  const queryClient = useQueryClient();
  const { currentPrice } = useCurrentPriceStore();
  const { currentSession, currentSessionInstrument } = useCurrentSessionStore();

  // Order inputs
  const pipSize = currentSessionInstrument?.pip_size ?? 1;
  const [qty, setQty] = useState<number>(1);
  const [tp, setTp] = useState<number | undefined>(undefined);
  const [sl, setSl] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // API hooks
  const { execute: createPosition, isLoading: isCreatingPosition } =
    useCreatePosition();

  // Cost/estimates from session
  const spreadPts = currentSession?.spread_pts ?? 0;
  const slippagePts = currentSession?.slippage_pts ?? 0;
  const commission = currentSession?.commission_per_fill ?? 0;

  const handleCreatePosition = async (side: "BUY" | "SELL") => {
    setError(null);

    // Validation
    if (!currentSession?.id) {
      setError("Session is required");
      return;
    }

    if (!currentPrice) {
      setError("Current price is not available");
      return;
    }

    if (!qty || qty <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    try {
      if (!currentSession.current_ts) {
        setError("Session timestamp is not available");
        return;
      }

      const request: CreatePositionRequest = {
        session_id: currentSession.id,
        side,
        entry_price: currentPrice,
        quantity_lots: qty,
        position_status: "OPEN",
        opened_at: currentSession.current_ts,
        ...(tp !== undefined && tp > 0 ? { tp_price: tp } : {}),
        ...(sl !== undefined && sl > 0 ? { sl_price: sl } : {}),
      };

      await createPosition(request);

      // Invalidate positions and transactions queries to refresh the tables
      const sessionId = String(currentSession.id);
      queryClient.invalidateQueries({
        queryKey: ["GET", `/sessions/${sessionId}/positions`],
      });
      queryClient.invalidateQueries({
        queryKey: ["GET", `/sessions/${sessionId}/transactions`],
      });
      queryClient.invalidateQueries({
        queryKey: ["GET", `/sessions/${sessionId}`],
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create position";
      setError(errorMessage);
    }
  };

  const handleBuy = () => {
    handleCreatePosition("BUY");
  };

  const handleSell = () => {
    handleCreatePosition("SELL");
  };

  const isDisabled =
    !currentSession?.id || !currentPrice || isCreatingPosition || qty <= 0;

  return (
    <div className={styles.panel}>
      <div className={styles.card}>
        <div className={styles.sectionHeader}>Order ticket</div>
        <div className={styles.formGrid}>
          <label className={styles.label}>Symbol</label>
          <div className={styles.input}>
            {currentSessionInstrument?.symbol ?? "-"}
          </div>

          <label className={styles.label}>Qty (lots)</label>
          <input
            className={styles.input}
            type="number"
            min={0}
            step={0.01}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />

          <label className={styles.label}>TP</label>
          <input
            className={styles.input}
            type="number"
            step={pipSize}
            value={tp ?? ""}
            onChange={(e) => setTp(Number(e.target.value))}
            placeholder={
              currentPrice !== undefined ? currentPrice.toString() : ""
            }
          />

          <label className={styles.label}>SL</label>
          <input
            className={styles.input}
            type="number"
            step={pipSize}
            value={sl ?? ""}
            onChange={(e) => setSl(Number(e.target.value))}
            placeholder={
              currentPrice !== undefined ? currentPrice.toString() : ""
            }
          />
        </div>

        <div className={styles.inlineInfo}>
          <span>Spread {spreadPts}pt</span>
          <span>Slippage {slippagePts}pt</span>
          <span>
            Commission {currency}
            {commission.toFixed(2)}
          </span>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.buy}`}
            onClick={handleBuy}
            disabled={isDisabled}
          >
            {isCreatingPosition ? "Creating..." : "Buy Market"}
          </button>
          <button
            className={`${styles.btn} ${styles.sell}`}
            onClick={handleSell}
            disabled={isDisabled}
          >
            {isCreatingPosition ? "Creating..." : "Sell Market"}
          </button>
        </div>
      </div>
    </div>
  );
}
