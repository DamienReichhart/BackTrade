import { useEffect } from "react";
import type { ISeriesApi } from "lightweight-charts";
import type { Candle } from "@backtrade/types";
import { convertCandleToChartData } from "../../../../utils/data/candles";

/**
 * Hook to update chart data when candles change
 *
 * @param seriesRef - Reference to the candlestick series
 * @param candles - Array of candle data
 */
export function useChartData(
    seriesRef: React.RefObject<ISeriesApi<"Candlestick"> | null>,
    candles: Candle[]
) {
    useEffect(() => {
        if (!seriesRef.current) return;

        if (candles.length === 0) {
            seriesRef.current.setData([]);
            return;
        }

        const chartData = candles.map(convertCandleToChartData);
        seriesRef.current.setData(chartData);
    }, [seriesRef, candles]);
}
