import { z } from "zod";

export const SessionStatusSchema = z.enum(["RUNNING", "PAUSED", "ARCHIVED"]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const TimeframeSchema = z.enum([
    "M1",
    "M5",
    "M10",
    "M15",
    "M30",
    "H1",
    "H2",
    "H4",
    "D1",
    "W1",
]);
export type Timeframe = z.infer<typeof TimeframeSchema>;

/**
 * Get all Timeframe enum values as an array
 */
export const TIMEFRAME_VALUES: Timeframe[] = [
    "M1",
    "M5",
    "M10",
    "M15",
    "M30",
    "H1",
    "H2",
    "H4",
    "D1",
    "W1",
];

/**
 * Map Timeframe to display label
 */
const TIMEFRAME_DISPLAY_MAP: Record<Timeframe, string> = {
    M1: "1 Minute",
    M5: "5 Minutes",
    M10: "10 Minutes",
    M15: "15 Minutes",
    M30: "30 Minutes",
    H1: "1 Hour",
    H2: "2 Hours",
    H4: "4 Hours",
    D1: "1 Day",
    W1: "1 Week",
};

/**
 * Get display label for a Timeframe enum value
 */
export function getTimeframeDisplayLabel(timeframe: Timeframe): string {
    return TIMEFRAME_DISPLAY_MAP[timeframe] ?? timeframe;
}

/**
 * Get Timeframe options for select dropdowns
 */
export function getTimeframeOptions(): Array<{
    value: Timeframe;
    label: string;
}> {
    return TIMEFRAME_VALUES.map((timeframe) => ({
        value: timeframe,
        label: getTimeframeDisplayLabel(timeframe),
    }));
}

export const SpeedSchema = z.enum([
    "SPEED_0_5X",
    "SPEED_1X",
    "SPEED_2X",
    "SPEED_3X",
    "SPEED_5X",
    "SPEED_10X",
    "SPEED_15X",
]);
export type Speed = z.infer<typeof SpeedSchema>;

/**
 * Map Prisma Speed enum to display format
 */
export const SPEED_DISPLAY_MAP: Record<Speed, string> = {
    SPEED_0_5X: "0.5x",
    SPEED_1X: "1x",
    SPEED_2X: "2x",
    SPEED_3X: "3x",
    SPEED_5X: "5x",
    SPEED_10X: "10x",
    SPEED_15X: "15x",
};

/**
 * Get display label for a Speed enum value
 */
export function getSpeedDisplayLabel(speed: Speed): string {
    return SPEED_DISPLAY_MAP[speed] ?? speed;
}

/**
 * Get all Speed enum values as an array
 * Extracted from the enum schema definition
 */
export const SPEED_VALUES: Speed[] = [
    "SPEED_0_5X",
    "SPEED_1X",
    "SPEED_2X",
    "SPEED_3X",
    "SPEED_5X",
    "SPEED_10X",
    "SPEED_15X",
];

/**
 * Get Speed options for select dropdowns
 */
export function getSpeedOptions(): Array<{ value: Speed; label: string }> {
    return SPEED_VALUES.map((speed) => ({
        value: speed,
        label: getSpeedDisplayLabel(speed),
    }));
}

// Numeric leverage allowed values; represented as numbers in APIs
export const LeverageSchema = z.union([
    z.literal(1),
    z.literal(50),
    z.literal(100),
    z.literal(200),
    z.literal(500),
    z.literal(1000),
]);
export type Leverage = z.infer<typeof LeverageSchema>;

/**
 * Get all Leverage enum values as an array
 */
export const LEVERAGE_VALUES: Leverage[] = [1, 50, 100, 200, 500, 1000];

/**
 * Get Leverage options for select dropdowns
 */
export function getLeverageOptions(): Array<{ value: string; label: string }> {
    return LEVERAGE_VALUES.map((leverage) => ({
        value: String(leverage),
        label: `${leverage}x`,
    }));
}
