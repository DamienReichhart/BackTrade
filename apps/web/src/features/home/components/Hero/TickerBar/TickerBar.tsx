import styles from "./TickerBar.module.css";

/**
 * Ticker interface
 */
interface Ticker {
    symbol: string;
}

/**
 * Available tickers
 */
const tickers: Ticker[] = [
    { symbol: "XAUUSD" },
    { symbol: "EURUSD" },
    { symbol: "BTCUSD" },
];

/**
 * Timeframe interface
 */
interface Timeframe {
    label: string;
}

/**
 * Available timeframes
 */
const timeframes: Timeframe[] = [
    { label: "M1" },
    { label: "M5" },
    { label: "M15" },
    { label: "M30" },
    { label: "H1" },
    { label: "H4" },
    { label: "D1" },
];

/**
 * TickerBar component
 *
 * Displays available trading symbols and timeframes
 */
export function TickerBar() {
    return (
        <div className={styles.tickerBar}>
            <div className={styles.section}>
                {tickers.map((ticker, index) => (
                    <span key={ticker.symbol}>
                        {index > 0 && (
                            <span className={styles.separator}>•</span>
                        )}
                        <span className={styles.ticker}>{ticker.symbol}</span>
                    </span>
                ))}
            </div>

            <div className={styles.section}>
                {timeframes.map((timeframe, index) => (
                    <span key={timeframe.label}>
                        {index > 0 && (
                            <span className={styles.separator}>•</span>
                        )}
                        <span className={styles.timeframe}>
                            {timeframe.label}
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}
