/**
 * Trading Constants
 *
 * Centralized configuration for trading-related constants used across the API.
 * Consolidates magic numbers to a single location for maintainability.
 */

/**
 * Trading constants for backtesting simulation
 */
export const TRADING_CONSTANTS = {
    /**
     * Default contract size for standard Forex lots (100,000 units of base currency)
     */
    DEFAULT_CONTRACT_SIZE: 100000,

    /**
     * Margin level threshold percentage below which liquidation cascade is triggered
     * When margin level drops below 50%, positions are liquidated starting from the worst-performing
     */
    LIQUIDATION_THRESHOLD_PERCENT: 50,

    /**
     * Maximum number of candles to fetch for chart display
     */
    MAX_CANDLES_FETCH: 2000,
} as const;

/**
 * Pagination constants for API responses
 */
export const PAGINATION_CONSTANTS = {
    /**
     * Default number of items per page when not specified
     */
    DEFAULT_PAGE_LIMIT: 20,

    /**
     * Maximum allowed items per page to prevent excessive data fetching
     */
    MAX_PAGE_LIMIT: 100,

    /**
     * Default page number when not specified
     */
    DEFAULT_PAGE: 1,
} as const;

/**
 * Position side multipliers for PnL calculation
 * BUY positions profit when price goes up, SELL positions profit when price goes down
 */
export const SIDE_MULTIPLIERS: Record<string, number> = {
    BUY: 1,
    SELL: -1,
} as const;
