import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
} from "lightweight-charts";
import { useCurrentSessionCandlesStore } from "../../../../../context/CurrentSessionCandlesContext";
import { convertCandleToChartData } from "../../../../../utils";
import styles from "./RunningSessionChart.module.css";



/**
 * RunningSessionChart component
 *
 * Displays a candlestick chart using Lightweight Charts library.
 * The chart data is managed by the CurrentSessionCandlesStore.
 */
export function RunningSessionChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const { candles } = useCurrentSessionCandlesStore();

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 520,
      layout: {
        background: { color: "transparent" },
        textColor: "#e6eef5",
      },
      grid: {
        vertLines: { color: "#e6eef5" },
        horzLines: { color: "#e6eef5" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#e6eef5",
      },
      rightPriceScale: {
        borderColor: "#e6eef5",
      },
      leftPriceScale: {
        borderColor: "#e6eef5",
      },
    });

    // Use addSeries with CandlestickSeries for v5 API
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    }) as ISeriesApi<"Candlestick">;

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  // Update chart data when candles change
  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    const chartData = candles.map(convertCandleToChartData);
    seriesRef.current.setData(chartData);
  }, [candles]);

  return (
    <div className={styles.chartContainer}>
      <div ref={chartContainerRef} className={styles.chart} />
    </div>
  );
}

