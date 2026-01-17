import { useEffect, useRef } from "react";
import type { ISeriesApi } from "lightweight-charts";
import type { Candle } from "@backtrade/types";
import { convertCandleToChartData } from "../../../../utils/data/candles";

/**
 * Hook to update chart data when candles change
 *
 * This hook intelligently updates the chart:
 * - On initial load or when candles array is completely replaced, it sets all data
 * - When candles are appended (e.g., via skip), it only updates/append the new candles
 *
 * Lightweight Charts requires that update() is only called with timestamps >= the last candle's timestamp.
 * If we detect any issue or older timestamps, we fall back to setData().
 *
 * @param seriesRef - Reference to the candlestick series
 * @param candles - Array of candle data
 * @param isReady - Whether the chart series has been initialized
 */
export function useChartData(
    seriesRef: React.RefObject<ISeriesApi<"Candlestick"> | null>,
    candles: Candle[],
    isReady: boolean
) {
    // Track the last known candles to detect if we're appending or replacing
    const lastCandlesRef = useRef<Candle[]>([]);
    const isInitialLoadRef = useRef(true);

    useEffect(() => {
        if (!isReady || !seriesRef.current) return;

        if (candles.length === 0) {
            seriesRef.current.setData([]);
            lastCandlesRef.current = [];
            isInitialLoadRef.current = true;
            return;
        }

        const lastCandles = lastCandlesRef.current;
        const isInitialLoad = isInitialLoadRef.current;

        // On initial load or when candles are completely replaced, set all data
        if (isInitialLoad || candles.length < lastCandles.length) {
            const chartData = candles.map(convertCandleToChartData);
            seriesRef.current.setData(chartData);
            lastCandlesRef.current = candles;
            isInitialLoadRef.current = false;
            return;
        }

        // Check if we're appending new candles
        // We can only use update() if the new candles have timestamps >= the last candle's timestamp
        if (lastCandles.length > 0 && candles.length > lastCandles.length) {
            // Find the last candle from previous state
            const lastCandleTs = lastCandles[lastCandles.length - 1]!.ts;
            const lastCandleTime = new Date(lastCandleTs).getTime();

            // Find the index of the last known candle in the new array
            const lastKnownIndex = candles.findIndex(
                (c) => c.ts === lastCandleTs
            );

            if (lastKnownIndex === -1) {
                // Last candle not found, might be a complete replacement
                const chartData = candles.map(convertCandleToChartData);
                seriesRef.current.setData(chartData);
                lastCandlesRef.current = candles;
                isInitialLoadRef.current = false;
                return;
            }

            // Get candles after the last known one
            const newCandles = candles.slice(lastKnownIndex + 1);

            if (newCandles.length === 0) {
                // No new candles, just update the reference
                lastCandlesRef.current = candles;
                isInitialLoadRef.current = false;
                return;
            }

            // Verify that all new candles have timestamps >= the last known candle
            // Lightweight Charts requires this for update() to work
            const allNewCandlesAreNewer = newCandles.every((candle) => {
                const candleTime = new Date(candle.ts).getTime();
                return candleTime >= lastCandleTime;
            });

            if (allNewCandlesAreNewer) {
                // All new candles are actually newer, safe to use update()
                const chartData = newCandles.map(convertCandleToChartData);

                // Update each candle (they will be appended in order)
                chartData.forEach((data) => {
                    seriesRef.current!.update(data);
                });

                lastCandlesRef.current = candles;
                isInitialLoadRef.current = false;
                return;
            }
        }

        // If we reach here, we can't safely use update() - fall back to setData()
        // This handles cases where:
        // - Candles were reordered
        // - Older candles were inserted
        // - Any other scenario where update() would fail
        const chartData = candles.map(convertCandleToChartData);
        seriesRef.current.setData(chartData);
        lastCandlesRef.current = candles;
        isInitialLoadRef.current = false;
    }, [seriesRef, candles, isReady]);
}
