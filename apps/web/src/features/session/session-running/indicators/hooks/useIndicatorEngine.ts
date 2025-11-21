import { useEffect, useMemo } from "react";
import type { Candle } from "@backtrade/types";
import type { IChartApi } from "lightweight-charts";
import { IndicatorEngine, type IndicatorConfig } from "../toolkit";

interface UseIndicatorEngineParams {
  chartRef: React.RefObject<IChartApi | null>;
  candles: Candle[];
  indicators: IndicatorConfig[];
  isReady: boolean;
}

/**
 * Hook that wires indicator engine to the chart lifecycle
 */
export function useIndicatorEngine({
  chartRef,
  candles,
  indicators,
  isReady,
}: UseIndicatorEngineParams) {
  const engine = useMemo(() => new IndicatorEngine(), []);

  useEffect(() => {
    return () => {
      engine.destroy();
    };
  }, [engine]);

  useEffect(() => {
    if (!isReady || !chartRef.current) {
      engine.setChart(null);
      return;
    }
    engine.setChart(chartRef.current);
    return () => {
      engine.setChart(null);
    };
  }, [chartRef, engine, isReady]);

  useEffect(() => {
    engine.setIndicators(indicators);
  }, [engine, indicators]);

  useEffect(() => {
    engine.setCandles(candles);
  }, [candles, engine]);
}
