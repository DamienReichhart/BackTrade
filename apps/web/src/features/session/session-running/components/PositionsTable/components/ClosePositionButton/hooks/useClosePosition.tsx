import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useClosePosition as useClosePositionBusinessApi } from "../../../../../../../../api/hooks/requests/positions";
import { useCurrentSessionStore } from "../../../../../../../../context/CurrentSessionContext";
import { useCurrentPriceStore } from "../../../../../../../../context/CurrentPriceContext";

/**
 * Hook to manage close position functionality
 *
 * @param positionId - Position ID to close
 * @param onError - Callback when close position fails
 * @param onSuccess - Callback when close position succeeds
 * @returns Close position state and handlers
 */
export function useClosePosition(
  positionId: number,
  onError?: (error: string) => void,
  onSuccess?: () => void,
) {
  const { currentSession } = useCurrentSessionStore();
  const { currentPrice } = useCurrentPriceStore();
  const sessionId = currentSession?.id?.toString();

  const queryClient = useQueryClient();
  const { execute: closePosition, isLoading: isClosing } =
    useClosePositionBusinessApi(String(positionId));

  const handleClose = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (!sessionId) {
        onError?.("Session ID is required");
        return;
      }

      try {
        if (!currentPrice) {
          onError?.("Current price is required");
          return;
        }

        await closePosition({
          position_status: "CLOSED",
          exit_price: currentPrice,
          closed_at: new Date().toISOString(),
        });

        // Invalidate queries to refresh positions and transactions
        queryClient.invalidateQueries({
          queryKey: ["GET", `/sessions/${sessionId}/positions`],
        });
        queryClient.invalidateQueries({
          queryKey: ["GET", `/sessions/${sessionId}/transactions`],
        });
        queryClient.invalidateQueries({
          queryKey: ["GET", `/sessions/${sessionId}`],
        });

        onSuccess?.();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to close position";
        onError?.(errorMessage);
      }
    },
    [sessionId, currentPrice, closePosition, queryClient, onError, onSuccess],
  );

  return {
    isClosing,
    handleClose,
  };
}
