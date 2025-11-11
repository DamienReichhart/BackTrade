import type { Position, Transaction, Session } from "@backtrade/types";

/**
 * Session metrics calculation result
 */
export interface SessionMetrics {
  equity: number;
  drawdownPct: number;
  winRate: number;
}

/**
 * Calculate session metrics including equity, drawdown, and win rate
 *
 * @param session - Current session data
 * @param positions - Array of positions
 * @param transactions - Array of transactions
 * @param currentPrice - Current market price
 * @returns Calculated session metrics
 */
export function calculateSessionMetrics(
  session: Session | undefined,
  positions: Position[],
  transactions: Transaction[],
  currentPrice: number | undefined,
): SessionMetrics {
  const start = session?.initial_balance ?? 0;

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
}
