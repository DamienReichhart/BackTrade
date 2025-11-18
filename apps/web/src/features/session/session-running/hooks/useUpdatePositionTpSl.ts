import { useQueryClient } from "@tanstack/react-query";
import { useUpdatePosition } from "../../../../api/hooks/requests/positions";
import { useCurrentSessionStore } from "../../../../store/session";
import type { UpdatePositionRequest } from "@backtrade/types";

/**
 * Hook to update position TP and SL values
 *
 * @param positionId - The ID of the position to update
 * @returns Mutation function and loading state
 */
export function useUpdatePositionTpSl(positionId: number) {
  const queryClient = useQueryClient();
  const { currentSession } = useCurrentSessionStore();
  const sessionId = currentSession ? String(currentSession.id) : "";

  const { execute: updatePosition, isLoading: isUpdating } = useUpdatePosition(
    String(positionId),
  );

  const updateTpSl = async (
    tp: number | undefined | null,
    sl: number | undefined | null,
  ): Promise<void> => {
    const updateData: UpdatePositionRequest = {};

    // Handle TP update
    if (tp !== undefined) {
      if (tp !== null && tp > 0) {
        updateData.tp_price = tp;
      } else {
        // Clear TP by setting to null
        updateData.tp_price = null;
      }
    }

    // Handle SL update
    if (sl !== undefined) {
      if (sl !== null && sl > 0) {
        updateData.sl_price = sl;
      } else {
        // Clear SL by setting to null
        updateData.sl_price = null;
      }
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return;
    }

    await updatePosition(updateData);

    // Invalidate positions queries to refresh the table
    if (sessionId) {
      queryClient.invalidateQueries({
        queryKey: ["GET", `/sessions/${sessionId}/positions`],
      });
      queryClient.invalidateQueries({
        queryKey: ["GET", `/positions`],
      });
      queryClient.invalidateQueries({
        queryKey: ["GET", `/sessions/${sessionId}/transactions`],
      });
    }
  };

  return {
    updateTpSl,
    isUpdating,
  };
}
