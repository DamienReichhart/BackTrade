import { create } from "zustand";
import type { Session, Instrument } from "@backtrade/types";

interface CurrentSessionState {
    currentSession: Session | undefined;
    currentSessionInstrument: Instrument | undefined;
    setCurrentSession: (session: Session | undefined) => void;
    setCurrentSessionInstrument: (instrument: Instrument | undefined) => void;
    clearCurrentSession: () => void;
}

/**
 * Zustand store for managing the current session and its instrument globally.
 * This store allows components throughout the application to access
 * and update the current session and instrument without prop drilling.
 */
export const useCurrentSessionStore = create<CurrentSessionState>((set) => ({
    currentSession: undefined,
    currentSessionInstrument: undefined,
    setCurrentSession: (session) => set({ currentSession: session }),
    setCurrentSessionInstrument: (instrument) =>
        set({ currentSessionInstrument: instrument }),
    clearCurrentSession: () =>
        set({ currentSession: undefined, currentSessionInstrument: undefined }),
}));
