import type { Candle } from "@backtrade/types";
import type { IChartApi } from "lightweight-charts";

/**
 * Available indicator identifiers
 */
export type IndicatorType = "sma" | "ema" | "bollingerBands" | "rsi";

/**
 * Possible candle value sources for indicator calculations
 */
export type IndicatorSource = "open" | "high" | "low" | "close";

/**
 * Base configuration shared by all indicators
 */
export interface IndicatorConfigBase {
    id: string;
    type: IndicatorType;
    name: string;
    isEnabled: boolean;
    order: number;
}

/**
 * Base configuration for line-based indicators
 */
export interface LineIndicatorConfig extends IndicatorConfigBase {
    source: IndicatorSource;
    lineWidth: number;
}

export interface ColoredIndicatorConfig extends IndicatorConfigBase {
    color: string;
}

export interface SmaIndicatorConfig
    extends LineIndicatorConfig, ColoredIndicatorConfig {
    type: "sma";
    period: number;
}

export interface EmaIndicatorConfig
    extends LineIndicatorConfig, ColoredIndicatorConfig {
    type: "ema";
    period: number;
    smoothing?: number;
}

export interface BollingerBandsIndicatorConfig extends LineIndicatorConfig {
    type: "bollingerBands";
    period: number;
    stdDev: number;
    source: IndicatorSource;
    basisColor: string;
    upperColor: string;
    lowerColor: string;
    fillOpacity: number;
}

export interface RsiIndicatorConfig
    extends LineIndicatorConfig, ColoredIndicatorConfig {
    type: "rsi";
    period: number;
    overbought: number;
    oversold: number;
    showZones: boolean;
}

export type IndicatorConfig =
    | SmaIndicatorConfig
    | EmaIndicatorConfig
    | BollingerBandsIndicatorConfig
    | RsiIndicatorConfig;

/**
 * Field definition used to dynamically render indicator configuration forms
 */
export type IndicatorFieldInputType = "number" | "select" | "color" | "switch";

export interface IndicatorFieldSelectOption {
    label: string;
    value: string;
}

export interface IndicatorFieldDefinition<
    TConfig extends IndicatorConfigBase = IndicatorConfigBase,
> {
    key: keyof TConfig & string;
    label: string;
    input: IndicatorFieldInputType;
    helperText?: string;
    min?: number;
    max?: number;
    step?: number;
    options?: IndicatorFieldSelectOption[];
}

/**
 * Runtime contract every indicator implementation must fulfill
 */
export interface IndicatorRuntime<TConfig extends IndicatorConfigBase> {
    updateConfig: (config: TConfig) => void;
    updateData: (candles: Candle[]) => void;
    destroy: () => void;
}

/**
 * Definition describing the metadata and runtime factory for an indicator
 */
export interface IndicatorDefinition<TConfig extends IndicatorConfigBase> {
    type: TConfig["type"];
    title: string;
    description: string;
    group: "trend" | "volatility" | "momentum";
    shortLabel: string;
    summary: (config: TConfig) => string;
    getDefaultConfig: (id: string, order: number) => TConfig;
    fields: IndicatorFieldDefinition<TConfig>[];
    createRuntime: (chart: IChartApi) => IndicatorRuntime<TConfig>;
}

export type IndicatorDefinitionMap = {
    [Key in IndicatorType]: IndicatorDefinition<
        Extract<IndicatorConfig, { type: Key }>
    >;
};
