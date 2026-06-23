import { useSessions } from "../../../api/hooks/requests/sessions";
import { countActiveSessions } from "../utils";

/**
 * Active-session usage against the current plan's quota.
 */
export function usePlanQuota(maxActiveSessions: number): {
    used: number;
    max: number;
    isLoading: boolean;
} {
    const { data, isLoading } = useSessions();
    const used = countActiveSessions(data ?? []);
    return { used, max: maxActiveSessions, isLoading };
}
