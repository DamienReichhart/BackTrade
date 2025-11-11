import type { PriceFormatCustom } from "lightweight-charts";
import type { ChartGridSettings } from "../../../../utils/localStorage";
import { getCSSVar } from "../../../../utils";

/**
 * Format price for chart display
 * Converts to string and truncates to max 5 decimal places without rounding
 *
 * @param price - The price value to format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
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
}

/**
 * Create price format configuration for lightweight charts
 *
 * @returns Price format configuration object
 */
export function createPriceFormat(): PriceFormatCustom {
  return {
    type: "custom",
    minMove: 0.00001,
    formatter: formatPrice,
  };
}

/**
 * Chart configuration options
 */
export interface ChartConfig {
  width: number;
  height: number;
  gridSettings: ChartGridSettings;
}

/**
 * Create chart configuration object for lightweight charts
 *
 * @param containerWidth - Width of the chart container
 * @param gridSettings - Grid and time scale settings
 * @returns Chart configuration object
 */
export function createChartConfig(
  containerWidth: number,
  gridSettings: ChartGridSettings,
) {
  const chartTextColor = getCSSVar("--color-chart-text");
  const chartBorderColor = getCSSVar("--color-chart-border");
  const chartUpColor = getCSSVar("--color-chart-up");
  const chartDownColor = getCSSVar("--color-chart-down");

  return {
    width: containerWidth,
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
    candlestickSeries: {
      upColor: chartUpColor,
      downColor: chartDownColor,
      borderVisible: false,
      wickUpColor: chartUpColor,
      wickDownColor: chartDownColor,
      priceFormat: createPriceFormat(),
    },
  };
}
