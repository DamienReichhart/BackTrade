import { useParams } from "react-router-dom";
import { useSessionInfo as useSessionInfoApi } from "../../../../api/hooks/requests/sessions";

/**
 * Hook to fetch session info from the API
 * Replaces client-side calculation with server-side data
 *
 * @returns Session info data and loading state
 */
export function useSessionInfo() {
    const { id = "" } = useParams();
    const { data, isLoading, error } = useSessionInfoApi(id);

    return {
        sessionInfo: data,
        isLoading,
        error,
    };
}
