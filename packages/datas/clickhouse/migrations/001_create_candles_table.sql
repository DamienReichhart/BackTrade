-- ClickHouse Migration: Create candles table
-- This table stores market data candles (OHLCV) for time-series analysis
-- Uses ReplacingMergeTree to handle duplicate candles (upsert behavior)
-- Duplicates are deduplicated based on (instrument_id, timeframe, ts), keeping latest updated_at

CREATE TABLE IF NOT EXISTS candles
(
    instrument_id UInt32 NOT NULL,
    timeframe String NOT NULL,
    ts DateTime NOT NULL,
    open Decimal64(8) NOT NULL,
    high Decimal64(8) NOT NULL,
    low Decimal64(8) NOT NULL,
    close Decimal64(8) NOT NULL,
    volume Float64 NOT NULL,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updated_at)
PRIMARY KEY (instrument_id, timeframe, ts)
ORDER BY (instrument_id, timeframe, ts)
PARTITION BY toYYYYMM(ts)
SETTINGS index_granularity = 8192;

-- Create indexes for common query patterns
ALTER TABLE candles ADD INDEX IF NOT EXISTS idx_instrument_timeframe (instrument_id, timeframe) TYPE minmax GRANULARITY 4;
ALTER TABLE candles ADD INDEX IF NOT EXISTS idx_ts (ts) TYPE minmax GRANULARITY 4;


