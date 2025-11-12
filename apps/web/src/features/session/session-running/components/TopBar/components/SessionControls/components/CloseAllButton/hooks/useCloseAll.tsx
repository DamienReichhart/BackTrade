import { useCallback } from "react";
import { useCloseAllPositions } from "../../../../../../../../../../api/hooks/requests/positions";
import { useCurrentSessionStore } from "../../../../../../../../../../context/CurrentSessionContext";

/**
 * Hook to manage close all positions functionality
 *
 * @param onError - Callback when close all fails
 * @param onSuccess - Callback when close all succeeds
 * @returns Close all state and handlers
 */
export function useCloseAll(
  onError?: (error: string) => void,
  onSuccess?: () => void,
) {
  const { currentSession } = useCurrentSessionStore();
  const sessionId = currentSession?.id?.toString();

  const { execute: closeAllPositions, isLoading: isClosing } =
    useCloseAllPositions(sessionId ?? "");

  const handleClick = useCallback(async () => {
    if (!sessionId) {
      onError?.("Session ID is required");
      return;
    }

    try {
      await closeAllPositions();
      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to close all positions";
      onError?.(errorMessage);
    }
  }, [sessionId, closeAllPositions, onError, onSuccess]);

  return {
    isClosing,
    isDisabled: !sessionId || isClosing,
    buttonText: isClosing ? "Closing..." : "Close all",
    handleClick,
  };
}
