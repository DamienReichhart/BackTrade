import styles from "./ChartPreview.module.css";

/**
 * ChartPreview component
 * 
 * Displays a simulated candlestick chart preview
 */
export function ChartPreview() {
  // Generate simulated candlestick data
  const candles = Array.from({ length: 20 }, (_, i) => {
    const isGreen = Math.random() > 0.5;
    const height = 40 + Math.random() * 80;
    const wickTop = Math.random() * 20;
    const wickBottom = Math.random() * 20;
    
    return {
      id: i,
      isGreen,
      height,
      wickTop,
      wickBottom,
      bottom: 20 + Math.random() * 40,
    };
  });

  return (
    <div className={styles.chartPreview}>
      <div className={styles.header}>
        <div className={styles.chartInfo}>
          <span className={styles.symbol}>Order ticket</span>
        </div>
      </div>
      
      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          {candles.map((candle) => (
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

