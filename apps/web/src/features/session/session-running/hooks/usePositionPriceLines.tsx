import { useEffect, useRef, type RefObject } from "react";
import type { Position } from "@backtrade/types";
import {
    LineStyle,
    type ISeriesApi,
    type IPriceLine,
} from "lightweight-charts";
import { getCSSVar } from "../../../../utils";
import { formatPrice } from "../utils/chart";

/**
 * Price line tracking for a single position
 */
interface PositionPriceLines {
    tpLine: IPriceLine | null;
    slLine: IPriceLine | null;
}

/**
 * Hook to manage take profit and stop loss price lines on the chart.
 *
 * Creates horizontal price lines for each open position that has TP/SL values.
 * Lines are automatically updated when positions change, and cleaned up when
 * positions are closed or TP/SL values are removed.
 *
 * @param seriesRef - Reference to the candlestick series
 * @param positions - Array of positions to display TP/SL lines for
 * @param isReady - Whether the chart series is initialized and ready
 */
export function usePositionPriceLines(
    seriesRef: RefObject<ISeriesApi<"Candlestick"> | null>,
    positions: Position[],
    isReady: boolean
) {
    // Track price lines per position to enable updates and cleanup
    const priceLinesMapRef = useRef<Map<number, PositionPriceLines>>(new Map());

    useEffect(() => {
        if (!isReady || !seriesRef.current) {
            return;
        }

        const series = seriesRef.current;
        const priceLinesMap = priceLinesMapRef.current;

        // Get current position IDs
        const currentPositionIds = new Set(
            positions
                .filter((p) => p.position_status === "OPEN")
                .map((p) => p.id)
        );

        // Remove price lines for positions that no longer exist or are closed
        for (const [positionId, lines] of priceLinesMap.entries()) {
            if (!currentPositionIds.has(positionId)) {
                if (lines.tpLine) {
                    series.removePriceLine(lines.tpLine);
                }
                if (lines.slLine) {
                    series.removePriceLine(lines.slLine);
                }
                priceLinesMap.delete(positionId);
            }
        }

        // Create or update price lines for current open positions
        for (const position of positions) {
            // Only show lines for open positions
            if (position.position_status !== "OPEN") {
                continue;
            }

            const positionId = position.id;
            let positionLines = priceLinesMap.get(positionId);

            // Initialize tracking if this is a new position
            if (!positionLines) {
                positionLines = { tpLine: null, slLine: null };
                priceLinesMap.set(positionId, positionLines);
            }

            const tpColor = getCSSVar("--color-success") || "#4ade80";
            const slColor = getCSSVar("--color-danger") || "#ef4444";
            const labelTextColor =
                getCSSVar("--color-text-primary") || "#ffffff";

            // Handle Take Profit line
            if (position.tp_price !== null && position.tp_price !== undefined) {
                if (positionLines.tpLine) {
                    // Update existing TP line if price changed
                    const currentPrice = positionLines.tpLine.options().price;
                    if (currentPrice !== position.tp_price) {
                        positionLines.tpLine.applyOptions({
                            price: position.tp_price,
                            title: `TP: ${formatPrice(position.tp_price)}`,
                        });
                    }
                } else {
                    // Create new TP line
                    positionLines.tpLine = series.createPriceLine({
                        price: position.tp_price,
                        color: tpColor,
                        lineWidth: 2,
                        lineStyle: LineStyle.Dashed,
                        axisLabelVisible: true,
                        title: `TP: ${formatPrice(position.tp_price)}`,
                        axisLabelColor: tpColor,
                        axisLabelTextColor: labelTextColor,
                    });
                }
            } else {
                // Remove TP line if it exists but position no longer has TP
                if (positionLines.tpLine) {
                    series.removePriceLine(positionLines.tpLine);
                    positionLines.tpLine = null;
                }
            }

            // Handle Stop Loss line
            if (position.sl_price !== null && position.sl_price !== undefined) {
                if (positionLines.slLine) {
                    // Update existing SL line if price changed
                    const currentPrice = positionLines.slLine.options().price;
                    if (currentPrice !== position.sl_price) {
                        positionLines.slLine.applyOptions({
                            price: position.sl_price,
                            title: `SL: ${formatPrice(position.sl_price)}`,
                        });
                    }
                } else {
                    // Create new SL line
                    positionLines.slLine = series.createPriceLine({
                        price: position.sl_price,
                        color: slColor,
                        lineWidth: 2,
                        lineStyle: LineStyle.Dashed,
                        axisLabelVisible: true,
                        title: `SL: ${formatPrice(position.sl_price)}`,
                        axisLabelColor: slColor,
                        axisLabelTextColor: labelTextColor,
                    });
                }
            } else {
                // Remove SL line if it exists but position no longer has SL
                if (positionLines.slLine) {
                    series.removePriceLine(positionLines.slLine);
                    positionLines.slLine = null;
                }
            }
        }
    }, [seriesRef, positions, isReady]);

    // Cleanup all price lines on unmount
    useEffect(() => {
        return () => {
            if (!seriesRef.current) {
                return;
            }

            const series = seriesRef.current;
            const priceLinesMap = priceLinesMapRef.current;

            for (const lines of priceLinesMap.values()) {
                if (lines.tpLine) {
                    try {
                        series.removePriceLine(lines.tpLine);
                    } catch {
                        // Chart may already be disposed
                    }
                }
                if (lines.slLine) {
                    try {
                        series.removePriceLine(lines.slLine);
                    } catch {
                        // Chart may already be disposed
                    }
                }
            }

            priceLinesMap.clear();
        };
    }, [seriesRef]);
}
