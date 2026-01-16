import { useEffect, useRef, useMemo } from "react";
import {
    createChart,
    ColorType,
    AreaSeries,
    type IChartApi,
} from "lightweight-charts";
import type { EquityCurvePoint } from "@backtrade/types";

/**
 * Hook return type for equity curve chart
 */
interface UseEquityCurveReturn {
    /** Ref for chart container */
    chartRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook for managing equity curve chart
 *
 * Handles chart initialization and data updates
 */
export function useEquityCurve(
    equityCurve: EquityCurvePoint[] | undefined
): UseEquityCurveReturn {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<IChartApi | null>(null);

    // Calculate chart data
    const chartData = useMemo(() => {
        if (!equityCurve || equityCurve.length === 0) return [];

        // Convert to chart format and sort by time
        const mapped = equityCurve.map((point) => ({
            time: new Date(point.time).getTime() / 1000,
            value: point.equity,
        }));

        // Sort by time to ensure ascending order
        mapped.sort((a, b) => a.time - b.time);

        // Handle duplicate timestamps by keeping the last value for each timestamp
        // This ensures strict ascending order required by lightweight-charts
        const deduplicated: typeof mapped = [];
        let lastTime = -Infinity;

        for (const point of mapped) {
            if (point.time > lastTime) {
                // New timestamp, add it
                deduplicated.push(point);
                lastTime = point.time;
            } else if (point.time === lastTime) {
                // Duplicate timestamp, replace the last entry with this one
                // (keeping the most recent equity value for this timestamp)
                deduplicated[deduplicated.length - 1] = point;
            }
            // If point.time < lastTime, it shouldn't happen after sorting, but skip it if it does
        }

        return deduplicated;
    }, [equityCurve]);

    // Initialize and update chart
    useEffect(() => {
        if (!chartRef.current || chartData.length === 0) return;

        // Clean up previous chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.remove();
        }

        const chart = createChart(chartRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "rgba(230, 238, 245, 0.7)",
            },
            grid: {
                vertLines: { color: "rgba(230, 238, 245, 0.05)" },
                horzLines: { color: "rgba(230, 238, 245, 0.05)" },
            },
            width: chartRef.current.clientWidth,
            height: 350,
            rightPriceScale: {
                borderColor: "rgba(230, 238, 245, 0.1)",
            },
            timeScale: {
                borderColor: "rgba(230, 238, 245, 0.1)",
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                vertLine: {
                    color: "rgba(138, 164, 197, 0.4)",
                    labelBackgroundColor: "rgba(138, 164, 197, 0.9)",
                },
                horzLine: {
                    color: "rgba(138, 164, 197, 0.4)",
                    labelBackgroundColor: "rgba(138, 164, 197, 0.9)",
                },
            },
        });

        // Determine colors based on overall performance
        const startValue = chartData[0]?.value ?? 0;
        const endValue = chartData[chartData.length - 1]?.value ?? 0;
        const isPositive = endValue >= startValue;

        const lineColor = isPositive
            ? "rgba(74, 222, 128, 0.9)"
            : "rgba(239, 68, 68, 0.9)";
        const topColor = isPositive
            ? "rgba(74, 222, 128, 0.3)"
            : "rgba(239, 68, 68, 0.3)";
        const bottomColor = isPositive
            ? "rgba(74, 222, 128, 0.02)"
            : "rgba(239, 68, 68, 0.02)";

        const areaSeries = chart.addSeries(AreaSeries, {
            lineColor,
            topColor,
            bottomColor,
            lineWidth: 2,
            priceFormat: {
                type: "price",
                precision: 2,
                minMove: 0.01,
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        areaSeries.setData(chartData as any);
        chart.timeScale().fitContent();

        chartInstanceRef.current = chart;

        // Handle resize
        const handleResize = () => {
            if (chartRef.current && chartInstanceRef.current) {
                chartInstanceRef.current.applyOptions({
                    width: chartRef.current.clientWidth,
                });
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (chartInstanceRef.current) {
                chartInstanceRef.current.remove();
                chartInstanceRef.current = null;
            }
        };
    }, [chartData]);

    return {
        chartRef,
    };
}
