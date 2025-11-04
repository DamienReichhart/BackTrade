import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
  type PriceFormatCustom,
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
        vertLines: { visible: false },
        horzLines: { visible: false },
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

    // Use addSeries with CandlestickSeries
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "custom",
        minMove: 0.00001,
        formatter: (price: number) => {
          // Convert to string and truncate to max 5 decimal places without rounding
          const str = price.toString();
          const decimalIndex = str.indexOf(".");

          if (decimalIndex === -1) {
            // No decimal point, return as is
            return str;
          }

          // Extract integer part and decimal part
          const integerPart = str.substring(0, decimalIndex);
          const decimalPart = str.substring(decimalIndex + 1);

          // Truncate to max 5 decimal places (not rounding)
          const truncatedDecimal = decimalPart.substring(0, 5);

          // Remove trailing zeros
          const trimmedDecimal = truncatedDecimal.replace(/0+$/, "");

          // Return formatted string
          if (trimmedDecimal === "") {
            return integerPart;
          }
          return `${integerPart}.${trimmedDecimal}`;
        },
      } as PriceFormatCustom,
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
