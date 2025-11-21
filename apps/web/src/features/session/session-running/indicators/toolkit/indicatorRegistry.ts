import { getCSSVar } from "../../../../../utils";
import { calculateEma, calculateSma } from "./calculations";
import {
  createBollingerRuntime,
  createLineSeriesRuntime,
  createRsiRuntime,
} from "./runtimes";
import type {
  BollingerBandsIndicatorConfig,
  EmaIndicatorConfig,
  IndicatorDefinition,
  IndicatorDefinitionMap,
  IndicatorFieldSelectOption,
  IndicatorType,
  RsiIndicatorConfig,
  SmaIndicatorConfig,
} from "./types";

const SOURCE_OPTIONS: IndicatorFieldSelectOption[] = [
  { label: "Close", value: "close" },
  { label: "Open", value: "open" },
  { label: "High", value: "high" },
  { label: "Low", value: "low" },
];

const resolveColor = (varName: string, fallback: string) => {
  const color = getCSSVar(varName);
  return color || fallback;
};

const indicatorDefinitions: IndicatorDefinitionMap = {
  sma: {
    type: "sma",
    title: "Simple Moving Average",
    description: "Smoothed line showing the average price over a period.",
    group: "trend",
    shortLabel: "SMA",
    summary: (config: SmaIndicatorConfig) => `Period ${config.period}`,
    getDefaultConfig: (id, order) => ({
      id,
      type: "sma",
      name: "SMA (20)",
      isEnabled: true,
      order,
      period: 20,
      source: "close",
      color: resolveColor("--color-info", "#3b82f6"),
      lineWidth: 2,
    }),
    fields: [
      {
        key: "period",
        label: "Period",
        input: "number",
        min: 2,
        max: 500,
        step: 1,
      },
      {
        key: "source",
        label: "Price Source",
        input: "select",
        options: SOURCE_OPTIONS,
      },
      {
        key: "color",
        label: "Line Color",
        input: "color",
      },
      {
        key: "lineWidth",
        label: "Line Width",
        input: "number",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
    createRuntime: (chart) =>
      createLineSeriesRuntime<SmaIndicatorConfig>(chart, {
        getSeriesOptions: (config) => ({
          color: config.color,
          lineWidth: config.lineWidth as never,
          priceScaleId: "right",
          priceLineVisible: false,
        }),
        getData: (candles, config) =>
          calculateSma(candles, config.period, config.source),
      }),
  },
  ema: {
    type: "ema",
    title: "Exponential Moving Average",
    description:
      "EMA weights recent price action more heavily for faster signals.",
    group: "trend",
    shortLabel: "EMA",
    summary: (config: EmaIndicatorConfig) => `Period ${config.period}`,
    getDefaultConfig: (id, order) => ({
      id,
      type: "ema",
      name: "EMA (12)",
      isEnabled: true,
      order,
      period: 12,
      source: "close",
      color: resolveColor("--color-success", "#4ade80"),
      lineWidth: 2,
    }),
    fields: [
      {
        key: "period",
        label: "Period",
        input: "number",
        min: 2,
        max: 500,
        step: 1,
      },
      {
        key: "source",
        label: "Price Source",
        input: "select",
        options: SOURCE_OPTIONS,
      },
      {
        key: "color",
        label: "Line Color",
        input: "color",
      },
      {
        key: "lineWidth",
        label: "Line Width",
        input: "number",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
    createRuntime: (chart) =>
      createLineSeriesRuntime<EmaIndicatorConfig>(chart, {
        getSeriesOptions: (config) => ({
          color: config.color,
          lineWidth: config.lineWidth as never,
          priceScaleId: "right",
          priceLineVisible: false,
        }),
        getData: (candles, config) =>
          calculateEma(candles, config.period, config.source),
      }),
  },
  bollingerBands: {
    type: "bollingerBands",
    title: "Bollinger Bands",
    description: "Volatility bands around a moving average.",
    group: "volatility",
    shortLabel: "BB",
    summary: (config: BollingerBandsIndicatorConfig) =>
      `${config.period} / ${config.stdDev}σ`,
    getDefaultConfig: (id, order) => ({
      id,
      type: "bollingerBands",
      name: "Bollinger (20, 2)",
      isEnabled: true,
      order,
      period: 20,
      stdDev: 2,
      source: "close",
      lineWidth: 2,
      basisColor: resolveColor("--color-text-secondary", "#94a3b8"),
      upperColor: resolveColor("--color-danger", "#ef4444"),
      lowerColor: resolveColor("--color-success", "#4ade80"),
      fillOpacity: 0.15,
    }),
    fields: [
      {
        key: "period",
        label: "Period",
        input: "number",
        min: 5,
        max: 500,
        step: 1,
      },
      {
        key: "stdDev",
        label: "Std Dev",
        input: "number",
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      {
        key: "source",
        label: "Price Source",
        input: "select",
        options: SOURCE_OPTIONS,
      },
      {
        key: "lineWidth",
        label: "Line Width",
        input: "number",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "basisColor",
        label: "Basis Color",
        input: "color",
      },
      {
        key: "upperColor",
        label: "Upper Band Color",
        input: "color",
      },
      {
        key: "lowerColor",
        label: "Lower Band Color",
        input: "color",
      },
    ],
    createRuntime: createBollingerRuntime,
  },
  rsi: {
    type: "rsi",
    title: "Relative Strength Index",
    description: "Momentum oscillator ranging between 0 and 100.",
    group: "momentum",
    shortLabel: "RSI",
    summary: (config: RsiIndicatorConfig) => `${config.period}-period`,
    getDefaultConfig: (id, order) => ({
      id,
      type: "rsi",
      name: "RSI (14)",
      isEnabled: true,
      order,
      period: 14,
      source: "close",
      color: resolveColor("--color-accent", "#8aa4c5"),
      lineWidth: 2,
      overbought: 70,
      oversold: 30,
      showZones: true,
    }),
    fields: [
      {
        key: "period",
        label: "Period",
        input: "number",
        min: 2,
        max: 200,
        step: 1,
      },
      {
        key: "source",
        label: "Price Source",
        input: "select",
        options: SOURCE_OPTIONS,
      },
      {
        key: "color",
        label: "Line Color",
        input: "color",
      },
      {
        key: "lineWidth",
        label: "Line Width",
        input: "number",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "overbought",
        label: "Overbought",
        input: "number",
        min: 50,
        max: 100,
        step: 1,
      },
      {
        key: "oversold",
        label: "Oversold",
        input: "number",
        min: 0,
        max: 50,
        step: 1,
      },
      {
        key: "showZones",
        label: "Show Zones",
        input: "switch",
      },
    ],
    createRuntime: createRsiRuntime,
  },
};

export const indicatorList = Object.values(
  indicatorDefinitions,
) as unknown as Array<
  IndicatorDefinition<
    | SmaIndicatorConfig
    | EmaIndicatorConfig
    | BollingerBandsIndicatorConfig
    | RsiIndicatorConfig
  >
>;

export function getIndicatorDefinition(type: IndicatorType) {
  return indicatorDefinitions[type];
}
