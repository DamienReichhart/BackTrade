import { useMemo } from "react";
import type { Session } from "@backtrade/types";
import { useInstrument } from "../../../api/hooks/requests/instruments";
import { getSessionDisplayName } from "../utils/sessions";

/**
 * Hook to manage session card data and display
 *
 * @param session - Session object
 * @returns Session card data and display values
 */
export function useSessionCard(session: Session) {
  // Fetch instrument data with automatic caching via React Query
  const { data: instrument, isLoading: isLoadingInstrument } = useInstrument(
    String(session.instrument_id),
  );

  // Display instrument name or fallback to ID while loading
  const instrumentDisplay = useMemo(() => {
    if (isLoadingInstrument) {
      return "Loading...";
    }
    if (instrument) {
      return instrument.display_name;
    }
    return `#${session.instrument_id}`;
  }, [isLoadingInstrument, instrument, session.instrument_id]);

  // Get the session display name
  const sessionName = useMemo(() => {
    return getSessionDisplayName(session);
  }, [session]);

  return {
    instrument,
    instrumentDisplay,
    sessionName,
    isLoadingInstrument,
  };
}
