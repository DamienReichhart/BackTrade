import type { Candle } from "@backtrade/types";
import type { IChartApi } from "lightweight-charts";
import { getIndicatorDefinition } from "./indicatorRegistry";
import type { IndicatorConfig, IndicatorRuntime } from "./types";

interface IndicatorInstance {
  id: string;
  runtime: IndicatorRuntime<IndicatorConfig>;
}

/**
 * Orchestrates indicator runtimes for the chart
 */
export class IndicatorEngine {
  private chart: IChartApi | null = null;
  private candles: Candle[] = [];
  private configs: IndicatorConfig[] = [];
  private instances = new Map<string, IndicatorInstance>();

  /**
   * Bind a chart instance to the engine
   */
  setChart(chart: IChartApi | null): void {
    if (this.chart === chart) {
      return;
    }

    if (!chart) {
      this.disposeInstances();
      this.chart = null;
      return;
    }

    this.chart = chart;
    this.syncInstances();
  }

  /**
   * Update active indicator configurations
   */
  setIndicators(configs: IndicatorConfig[]): void {
    this.configs = [...configs].sort((a, b) => a.order - b.order);
    this.syncInstances();
  }

  /**
   * Push latest candles to indicators
   */
  setCandles(candles: Candle[]): void {
    this.candles = candles;
    this.instances.forEach((instance) => {
      instance.runtime.updateData(this.candles);
    });
  }

  /**
   * Dispose engine resources
   */
  destroy(): void {
    this.disposeInstances();
    this.chart = null;
  }

  private syncInstances(): void {
    if (!this.chart) {
      return;
    }

    const enabled = this.configs.filter((config) => config.isEnabled);
    const activeIds = new Set<string>();

    enabled.forEach((config) => {
      activeIds.add(config.id);
      const existing = this.instances.get(config.id);

      if (existing) {
        existing.runtime.updateConfig(config as never);
        return;
      }

      const definition = getIndicatorDefinition(config.type);
      if (!definition) {
        return;
      }

      if (!this.chart) {
        return;
      }

      const runtime = definition.createRuntime(this.chart);
      runtime.updateConfig(config as never);
      runtime.updateData(this.candles);

      this.instances.set(config.id, {
        id: config.id,
        runtime: runtime as IndicatorRuntime<IndicatorConfig>,
      });
    });

    [...this.instances.entries()].forEach(([id, instance]) => {
      if (!activeIds.has(id)) {
        instance.runtime.destroy();
        this.instances.delete(id);
      }
    });
  }

  private disposeInstances(): void {
    this.instances.forEach((instance) => instance.runtime.destroy());
    this.instances.clear();
  }
}
