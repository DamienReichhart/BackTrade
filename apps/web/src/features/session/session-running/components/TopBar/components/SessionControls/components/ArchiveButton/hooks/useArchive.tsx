import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useArchiveSession } from "../../../../../../../../../../api/hooks/requests/sessions";
import { useCurrentSessionStore } from "../../../../../../../../../../store/session";
import { useQueryClient } from "@tanstack/react-query";
import { formatLocalDateTimeToISO } from "../../../../../../../../../session-add/utils";
import { redirectToSessionAnalytics } from "../../../../../../../../../../utils";

/**
 * Hook to manage archive session functionality
 *
 * @param onError - Callback when archive fails
 * @param onSuccess - Callback when archive succeeds
 * @returns Archive state and handlers
 */
export function useArchive(
    onError?: (error: string) => void,
    onSuccess?: () => void
) {
    const { id = "" } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { currentSession } = useCurrentSessionStore();

    const { execute: archiveSession, isLoading: isArchiving } =
        useArchiveSession(id);

    const handleArchive = useCallback(async () => {
        if (!id) {
            onError?.("Session ID is required");
            return;
        }

        // Prevent archiving if already archived
        if (currentSession?.session_status === "ARCHIVED") {
            onError?.("Session is already archived");
            return;
        }

        try {
            const updatedSession = await archiveSession({
                session_status: "ARCHIVED",
                end_time: currentSession?.end_time
                    ? formatLocalDateTimeToISO(currentSession.end_time)
                    : undefined,
            });

            // Invalidate queries to refresh session data
            queryClient.invalidateQueries({ queryKey: ["GET", "/sessions"] });
            queryClient.invalidateQueries({
                queryKey: ["GET", `/sessions/${id}`],
            });

            // Update the current session in the store
            if (updatedSession) {
                useCurrentSessionStore
                    .getState()
                    .setCurrentSession(updatedSession);
            }

            onSuccess?.();

            // Navigate to analytics page after successful archive
            redirectToSessionAnalytics(String(id));
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to archive session";
            onError?.(errorMessage);
        }
    }, [
        id,
        archiveSession,
        currentSession,
        queryClient,
        navigate,
        onError,
        onSuccess,
    ]);

    return {
        isArchiving,
        isDisabled:
            !id || isArchiving || currentSession?.session_status === "ARCHIVED",
        handleArchive,
    };
}
