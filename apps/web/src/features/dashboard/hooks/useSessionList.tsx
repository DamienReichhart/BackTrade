import type { Session } from "@backtrade/types";
import { useSessions } from "../../../api/hooks/requests/sessions";

/**
 * Hook to manage session list data and state
 *
 * @returns Session list data, loading state, and error
 */
export function useSessionList() {
  const { data, isLoading, error } = useSessions();

  const sessions: Session[] = (data as Session[]) ?? [];

  return {
    sessions,
    isLoading,
    error: error as Error | null,
  };
}
