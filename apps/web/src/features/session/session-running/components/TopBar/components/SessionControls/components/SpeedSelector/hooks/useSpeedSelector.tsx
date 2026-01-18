import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    type Speed,
    SPEED_VALUES,
    getSpeedDisplayLabel,
} from "@backtrade/types";
import { useUpdateSession } from "../../../../../../../../../../api/hooks/requests/sessions";
import { useCurrentSessionStore } from "../../../../../../../../../../store/session";

/**
 * Hook to manage speed selector functionality
 *
 * @param onError - Callback when speed update fails
 * @param onSuccess - Callback when speed update succeeds
 * @returns Speed selector state and handlers
 */
export function useSpeedSelector(
    onError?: (error: string) => void,
    onSuccess?: () => void
) {
    const { currentSession } = useCurrentSessionStore();
    const currentSpeed = currentSession?.speed ?? "SPEED_1X";
    const sessionId = currentSession?.id?.toString();

    const queryClient = useQueryClient();
    const { execute: updateSession, isLoading: isUpdatingSpeed } =
        useUpdateSession(sessionId ?? "");

    const speedOptions = useMemo(
        () =>
            SPEED_VALUES.map((speed) => ({
                value: speed,
                label: getSpeedDisplayLabel(speed),
            })),
        []
    );

    const handleSpeedSelect = useCallback(
        async (speed: string) => {
            if (!sessionId) {
                onError?.("Session ID is required");
                return;
            }

            const speedValue = speed as Speed;

            if (speedValue === currentSpeed) {
                return;
            }

            try {
                const updatedSession = await updateSession({
                    speed: speedValue,
                });

                // Update the session query cache with the mutation result
                queryClient.setQueryData(
                    ["GET", `/sessions/${sessionId}`],
                    updatedSession
                );
                onSuccess?.();
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to update session speed";
                onError?.(errorMessage);
            }
        },
        [
            sessionId,
            currentSpeed,
            updateSession,
            queryClient,
            onError,
            onSuccess,
        ]
    );

    return {
        currentSpeed,
        speedOptions,
        isUpdatingSpeed,
        isDisabled: !sessionId || isUpdatingSpeed,
        handleSpeedSelect,
    };
}
