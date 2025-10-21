import { useMemo } from "react";
import styles from "./ChartPreview.module.css";

/**
 * Generate deterministic pseudo-random data for chart preview
 * Uses a simple linear congruential generator with a fixed seed
 */
function generateChartData() {
  // Random seed
  let seed = 123456;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  return Array.from({ length: 60 }, (_, i) => {
    const isGreen = lcg() > 0.5;
    const height = 40 + lcg() * 80;
    const wickTop = lcg() * 20;
    const wickBottom = lcg() * 20;

    return {
      id: i,
      isGreen,
      height,
      wickTop,
      wickBottom,
      bottom: (i + wickBottom) * 40
    };
  });
}

/**
 * ChartPreview component
 *
 * Displays a simulated candlestick chart preview
 */
export function ChartPreview() {
  // Generate simulated candlestick data (memoized to avoid impure function calls on every render)
  const candles = useMemo(() => generateChartData(), []);

  return (
    <div className={styles.chartPreview}>
      <div className={styles.header}>
        <div className={styles.chartInfo}>
          <span className={styles.symbol}>Order ticket</span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          {candles.map(candle => (
            <div key={candle.id} className={styles.candleWrapper}>
              <div
                className={styles.wick}
                style={{
                  height: `${candle.wickTop}px`,
                  bottom: `${candle.bottom + candle.height}px`
                }}
              />
              <div
                className={`${styles.candle} ${candle.isGreen ? styles.green : styles.red}`}
                style={{
                  height: `${candle.height}px`,
                  bottom: `${candle.bottom}px`
                }}
              />
              <div
                className={styles.wick}
                style={{
                  height: `${candle.wickBottom}px`,
                  bottom: `${candle.bottom - candle.wickBottom}px`
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
