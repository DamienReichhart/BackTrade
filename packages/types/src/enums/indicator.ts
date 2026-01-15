import { z } from "zod";

/**
 * Available indicator types
 */
export const IndicatorTypeSchema = z.enum([
    "sma",
    "ema",
    "bollingerBands",
    "rsi",
]);
export type IndicatorType = z.infer<typeof IndicatorTypeSchema>;

/**
 * Possible candle value sources for indicator calculations
 */
export const IndicatorSourceSchema = z.enum(["open", "high", "low", "close"]);
export type IndicatorSource = z.infer<typeof IndicatorSourceSchema>;

/**
 * Field input types for indicator configuration forms
 */
export const IndicatorFieldInputTypeSchema = z.enum([
    "number",
    "select",
    "color",
    "switch",
]);
export type IndicatorFieldInputType = z.infer<
    typeof IndicatorFieldInputTypeSchema
>;

/**
 * Get all IndicatorType enum values as an array
 */
export const INDICATOR_TYPE_VALUES: IndicatorType[] = [
    "sma",
    "ema",
    "bollingerBands",
    "rsi",
];

/**
 * Get all IndicatorSource enum values as an array
 */
export const INDICATOR_SOURCE_VALUES: IndicatorSource[] = [
    "open",
    "high",
    "low",
    "close",
];

/**
 * Get all IndicatorFieldInputType enum values as an array
 */
export const INDICATOR_FIELD_INPUT_TYPE_VALUES: IndicatorFieldInputType[] = [
    "number",
    "select",
    "color",
    "switch",
];
