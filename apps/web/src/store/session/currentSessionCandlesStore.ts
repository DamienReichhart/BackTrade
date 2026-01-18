import { create } from "zustand";
import type { Candle } from "@backtrade/types";

interface CurrentSessionCandlesState {
    candles: Candle[];
    setCandles: (candles: Candle[]) => void;
    appendCandle: (candle: Candle) => void;
    clearCandles: () => void;
    getLastCandle: () => Candle | undefined;
    updateLastCandle: (updatedCandle: Candle) => void;
}

/**
 * Zustand store for managing the current session candles data globally.
 * This store holds the last 1000 candles for the configured timeframe
 * and allows components to access and update candle data without prop drilling.
 */
export const useCurrentSessionCandlesStore = create<CurrentSessionCandlesState>(
    (set, get) => ({
        candles: [],
        setCandles: (candles) => {
            // Keep only the last 1000 candles
            const last1000 = candles.slice(-1000);
            set({ candles: last1000 });
        },
        appendCandle: (candle) => {
            const currentCandles = get().candles;

            // Check if candle already exists (by timestamp)
            const existingIndex = currentCandles.findIndex(
                (c) => c.ts === candle.ts
            );

            if (existingIndex !== -1) {
                // Update existing candle
                const updated = currentCandles.map((c) =>
                    c.ts === candle.ts ? candle : c
                );
                // Keep only the last 1000 candles
                const last1000 = updated.slice(-1000);
                set({ candles: last1000 });
                return;
            }

            // New candle - insert it in the correct position (sorted by timestamp)
            // This ensures candles are always in chronological order
            const candleTime = new Date(candle.ts).getTime();

            // Find the insertion point (first candle with timestamp >= new candle)
            let insertIndex = currentCandles.length;
            for (let i = 0; i < currentCandles.length; i++) {
                const currentTime = new Date(currentCandles[i]!.ts).getTime();
                if (currentTime >= candleTime) {
                    insertIndex = i;
                    break;
                }
            }

            // Insert the candle at the correct position
            const updated = [
                ...currentCandles.slice(0, insertIndex),
                candle,
                ...currentCandles.slice(insertIndex),
            ];

            // Keep only the last 1000 candles
            const last1000 = updated.slice(-1000);
            set({ candles: last1000 });
        },
        clearCandles: () => set({ candles: [] }),
        getLastCandle: () => {
            const candles = get().candles;
            return candles.length > 0 ? candles[candles.length - 1] : undefined;
        },
        updateLastCandle: (updatedCandle) => {
            const currentCandles = get().candles;
            if (currentCandles.length === 0) {
                // No candles to update, just append
                set({ candles: [updatedCandle] });
                return;
            }

            // Update the last candle
            const updated = [...currentCandles.slice(0, -1), updatedCandle];

            // Keep only the last 1000 candles
            const last1000 = updated.slice(-1000);
            set({ candles: last1000 });
        },
    })
);
