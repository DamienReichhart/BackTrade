import { create } from "zustand";
import type { Candle } from "@backtrade/types";

interface CurrentSessionCandlesState {
    candles: Candle[];
    setCandles: (candles: Candle[]) => void;
    clearCandles: () => void;
}

/**
 * Zustand store for managing the current session candles data globally.
 * This store holds the last 1000 candles for the configured timeframe
 * and allows components to access and update candle data without prop drilling.
 */
export const useCurrentSessionCandlesStore = create<CurrentSessionCandlesState>(
    (set) => ({
        candles: [],
        setCandles: (candles) => {
            // Keep only the last 1000 candles
            const last1000 = candles.slice(-1000);
            set({ candles: last1000 });
        },
        clearCandles: () => set({ candles: [] }),
    })
);
