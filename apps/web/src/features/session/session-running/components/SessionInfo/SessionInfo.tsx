import styles from "./SessionInfo.module.css";
import type { Position, Transaction } from "@backtrade/types";
import { useMemo } from "react";
import { usePositionsBySession } from "../../../../../api/requests/positions";
import { useTransactionsBySession } from "../../../../../api/requests/transactions";
import { useCurrentPriceStore } from "../../../../../context/CurrentPriceContext";
import { useCurrentSessionStore } from "../../../../../context/CurrentSessionContext";

/**
 * Session info component displaying session KPIs (balance, equity, drawdown, win rate, leverage).
 * Uses currentSession from the global store, which is set by SessionRunning.
 */
export function SessionInfo() {
  const currency = "€";
  const { currentPrice } = useCurrentPriceStore();
  const { currentSession } = useCurrentSessionStore();
  const sessionId = currentSession ? String(currentSession.id) : "";

  // Open positions and transactions
  // Only fetch if we have a valid session from the store
  const hasValidSession = !!currentSession && !!sessionId && sessionId !== "";
  const { data: positionsData } = usePositionsBySession(sessionId, undefined, {
    enabled: hasValidSession,
  });
  const { data: transactionsData } = useTransactionsBySession(
    sessionId,
    undefined,
    {
      enabled: hasValidSession,
    },
  );
  const positions = (positionsData as Position[]) || [];
  const transactions = (transactionsData as Transaction[]) || [];

  // Equity, drawdown, win rate
  const equityCalc = useMemo(() => {
    const start = currentSession?.initial_balance ?? 0;
    // Calculate unrealized PnL for open positions only
    const unrealized = positions.reduce((sum, p) => {
      // Only calculate for OPEN positions
      if (p.position_status !== "OPEN" || !currentPrice) {
        return sum;
      }
      // Calculate unrealized PnL: (currentPrice - entry_price) * quantity * side_multiplier
      // BUY: positive if currentPrice > entry_price
      // SELL: positive if currentPrice < entry_price
      const priceDiff = currentPrice - p.entry_price;
      const sideMultiplier = p.side === "BUY" ? 1 : -1;
      const pnl = priceDiff * p.quantity_lots * sideMultiplier;
      return sum + pnl;
    }, 0);

    // Sort transactions by time
    const sorted = [...transactions].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    // Use balance_after to build closed-equity curve
    let peak = start;
    let maxDrawdown = 0;
    let lastBalance = start;
    for (const t of sorted) {
      const bal = t.balance_after ?? lastBalance + t.amount;
      lastBalance = bal;
      if (bal > peak) peak = bal;
      const dd = peak > 0 ? (peak - bal) / peak : 0;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    const equity = lastBalance + unrealized;

    // Current drawdown relative to peak of closed balance
    const currentDD = peak > 0 ? (peak - lastBalance) / peak : 0;

    // Win rate: only PNL transactions where amount != 0
    const pnlTx = sorted.filter(
      (t) => t.transaction_type === "PNL" && t.amount !== 0,
    );
    const wins = pnlTx.filter((t) => t.amount > 0).length;
    const total = pnlTx.length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;

    return {
      equity,
      drawdownPct: Math.max(currentDD, maxDrawdown) * 100,
      winRate,
    };
  }, [currentSession?.initial_balance, positions, transactions, currentPrice]);

  const isLoading = !currentSession || !hasValidSession;

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.sectionHeader}>Session info</div>
        <div className={styles.infoGrid}>
          <div>
            <div className={styles.infoLabel}>Start balance</div>
            <div className={styles.infoValue}>Loading…</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Current equity</div>
            <div className={styles.infoValue}>Loading…</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Drawdown</div>
            <div className={styles.infoValue}>Loading…</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Win rate</div>
            <div className={styles.infoValue}>Loading…</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Leverage</div>
            <div className={styles.infoValue}>Loading…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.sectionHeader}>Session info</div>
      <div className={styles.infoGrid}>
        <div>
          <div className={styles.infoLabel}>Start balance</div>
          <div className={styles.infoValue}>
            {currency}{" "}
            {(currentSession?.initial_balance ?? 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div>
          <div className={styles.infoLabel}>Current equity</div>
          <div className={styles.infoValue}>
            {currency}{" "}
            {equityCalc.equity.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div>
          <div className={styles.infoLabel}>Drawdown</div>
          <div className={styles.infoValue}>
            -{equityCalc.drawdownPct.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className={styles.infoLabel}>Win rate</div>
          <div className={styles.infoValue}>
            {equityCalc.winRate.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className={styles.infoLabel}>Leverage</div>
          <div className={styles.infoValue}>
            × {currentSession?.leverage ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}
