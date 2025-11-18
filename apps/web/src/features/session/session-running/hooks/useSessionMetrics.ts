import { useMemo } from "react";
import type { Position, Transaction } from "@backtrade/types";
import { usePositionsBySession } from "../../../../api/hooks/requests/positions";
import { useTransactionsBySession } from "../../../../api/hooks/requests/transactions";
import {
  useCurrentPriceStore,
  useCurrentSessionStore,
} from "../../../../store/session";
import { calculateSessionMetrics } from "../utils/sessionMetrics";

/**
 * Hook to calculate and return session metrics
 *
 * @returns Session metrics and loading state
 */
export function useSessionMetrics() {
  const { currentPrice } = useCurrentPriceStore();
  const { currentSession } = useCurrentSessionStore();
  const sessionId = currentSession ? String(currentSession.id) : "";

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

  const metrics = useMemo(() => {
    return calculateSessionMetrics(
      currentSession,
      positions,
      transactions,
      currentPrice,
    );
  }, [currentSession, positions, transactions, currentPrice]);

  return {
    metrics,
    isLoading: !currentSession || !hasValidSession,
  };
}
