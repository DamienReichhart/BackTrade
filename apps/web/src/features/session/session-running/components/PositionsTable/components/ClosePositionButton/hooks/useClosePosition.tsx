import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useClosePosition as useClosePositionBusinessLogic } from "../../../../../../../../api/hooks/requests/positions";
import { useCurrentSessionStore } from "../../../../../../../../context/CurrentSessionContext";

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
  const sessionId = currentSession?.id?.toString();

  const queryClient = useQueryClient();
  const { execute: closePosition, isLoading: isClosing } = useClosePositionBusinessLogic(
    String(positionId),
  );

  const handleClose = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (!sessionId) {
        onError?.("Session ID is required");
        return;
      }

      try {
        await closePosition();

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
    [sessionId, closePosition, queryClient, onError, onSuccess],
  );

  return {
    isClosing,
    handleClose,
  };
}

