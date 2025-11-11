import { useQueryClient } from "@tanstack/react-query";
import type { CreatePositionRequest } from "@backtrade/types";
import { useCreatePosition } from "../../../../api/hooks/requests/positions";
import { useCurrentPriceStore } from "../../../../context/CurrentPriceContext";
import { useCurrentSessionStore } from "../../../../context/CurrentSessionContext";
import type { OrderFormActions } from "./useOrderForm";

/**
 * Validation error messages
 */
export interface ValidationError {
  message: string;
}

/**
 * Hook to handle position creation logic
 *
 * @param formActions - Order form actions for error handling
 * @returns Position creation function and loading state
 */
export function usePositionCreation(formActions: OrderFormActions) {
  const queryClient = useQueryClient();
  const { currentPrice } = useCurrentPriceStore();
  const { currentSession } = useCurrentSessionStore();
  const { execute: createPosition, isLoading: isCreatingPosition } =
    useCreatePosition();

  /**
   * Validate position creation inputs
   */
  const validatePosition = (
    qty: number,
  ): { isValid: boolean; error?: string } => {
    if (!currentSession?.id) {
      return { isValid: false, error: "Session is required" };
    }

    if (!currentPrice) {
      return { isValid: false, error: "Current price is not available" };
    }

    if (!qty || qty <= 0) {
      return { isValid: false, error: "Quantity must be greater than 0" };
    }

    if (!currentSession.current_ts) {
      return { isValid: false, error: "Session timestamp is not available" };
    }

    return { isValid: true };
  };

  /**
   * Create a position with the given side
   */
  const createPositionWithSide = async (
    side: "BUY" | "SELL",
    qty: number,
    tp: number | undefined,
    sl: number | undefined,
  ): Promise<void> => {
    formActions.setError(null);

    const validation = validatePosition(qty);
    if (!validation.isValid) {
      formActions.setError(validation.error ?? "Validation failed");
      return;
    }

    if (!currentSession || !currentPrice) {
      return;
    }

    try {
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
      formActions.setError(errorMessage);
    }
  };

  return {
    createPositionWithSide,
    isCreatingPosition,
  };
}
