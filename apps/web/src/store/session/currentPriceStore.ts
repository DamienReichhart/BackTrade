import { create } from "zustand";

interface CurrentPriceState {
    currentPrice: number | undefined;
    setCurrentPrice: (price: number | undefined) => void;
}

/**
 * Zustand store for managing the current price globally.
 * This store is updated when the session timestamp changes,
 * allowing all components to access the current price.
 */
export const useCurrentPriceStore = create<CurrentPriceState>((set) => ({
    currentPrice: undefined,
    setCurrentPrice: (price) => set({ currentPrice: price }),
}));
