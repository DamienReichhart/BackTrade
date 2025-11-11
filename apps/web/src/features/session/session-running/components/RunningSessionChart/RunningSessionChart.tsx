import { useEffect, useRef, useState } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
  type PriceFormatCustom,
} from "lightweight-charts";
import { useCurrentSessionCandlesStore } from "../../../../../context/CurrentSessionCandlesContext";
import { convertCandleToChartData } from "../../../../../utils";
import {
  getChartGridSettings,
  type ChartGridSettings,
} from "../../../../../utils/localStorage";
import { ChartMenuButton } from "./components/ChartMenuButton";
import styles from "./RunningSessionChart.module.css";
import { getCSSVar } from "../../../../../utils";

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
  const [gridSettings, setGridSettings] = useState<ChartGridSettings>(() =>
    getChartGridSettings(),
  );

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartTextColor = getCSSVar("--color-chart-text");
    const chartBorderColor = getCSSVar("--color-chart-border");
    const chartUpColor = getCSSVar("--color-chart-up");
    const chartDownColor = getCSSVar("--color-chart-down");

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 520,
      layout: {
        background: { color: "transparent" },
        textColor: chartTextColor,
      },
      grid: {
        vertLines: { visible: gridSettings.vertLines },
        horzLines: { visible: gridSettings.horzLines },
      },
      timeScale: {
        timeVisible: gridSettings.timeVisible,
        secondsVisible: gridSettings.secondsVisible,
        borderColor: chartBorderColor,
      },
      rightPriceScale: {
        borderColor: chartBorderColor,
      },
      leftPriceScale: {
        borderColor: chartBorderColor,
      },
    });

    // Use addSeries with CandlestickSeries
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: chartUpColor,
      downColor: chartDownColor,
      borderVisible: false,
      wickUpColor: chartUpColor,
      wickDownColor: chartDownColor,
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
    if (!seriesRef.current) return;

    if (candles.length === 0) {
      seriesRef.current.setData([]);
      return;
    }

    const chartData = candles.map(convertCandleToChartData);
    seriesRef.current.setData(chartData);
  }, [candles]);

  // Update chart grid and time scale when settings change
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      grid: {
        vertLines: { visible: gridSettings.vertLines },
        horzLines: { visible: gridSettings.horzLines },
      },
      timeScale: {
        timeVisible: gridSettings.timeVisible,
        secondsVisible: gridSettings.secondsVisible,
      },
    });
  }, [gridSettings]);

  // Handle grid settings change from ChartControls
  const handleGridSettingsChange = (settings: ChartGridSettings) => {
    setGridSettings(settings);
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.menuButtonWrapper}>
        <ChartMenuButton onSettingsChange={handleGridSettingsChange} />
      </div>
      <div ref={chartContainerRef} className={styles.chart} />
    </div>
  );
}
