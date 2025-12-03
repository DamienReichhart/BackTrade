import { useMemo } from "react";
import type { Position } from "@backtrade/types";
import type { SeriesMarker, Time } from "lightweight-charts";
import { getCSSVar } from "../../../../utils";
import { formatPrice } from "../utils/chart";

/**
 * Build chart markers representing every open/close event of the provided positions.
 *
 * @param positions - Full position list for the session
 * @returns Lightweight Charts markers ready to be applied on the candlestick series
 */
export function usePositionMarkers(
    positions: Position[]
): SeriesMarker<Time>[] {
    const longColor = getCSSVar("--color-success");
    const shortColor = getCSSVar("--color-danger");

    return useMemo<SeriesMarker<Time>[]>(() => {
        if (!positions.length) {
            return [];
        }

        const markers = positions.flatMap((position) => {
            const openMarker = buildOpenMarker(position, longColor, shortColor);
            const closeMarker = buildCloseMarker(
                position,
                longColor,
                shortColor
            );

            return [openMarker, closeMarker].filter(
                (marker): marker is SeriesMarker<Time> => Boolean(marker)
            );
        });

        // Ensure chronological order so markers render deterministically
        return markers.sort(
            (a, b) => Number(a.time ?? 0) - Number(b.time ?? 0)
        );
    }, [positions, longColor, shortColor]);
}

function buildOpenMarker(
    position: Position,
    longColor: string,
    shortColor: string
): SeriesMarker<Time> | undefined {
    const openedTime = toChartTime(position.opened_at);
    if (!openedTime) {
        return undefined;
    }

    const isLong = position.side === "BUY";
    const color = isLong ? longColor : shortColor;
    const sideLabel = isLong ? "Buy" : "Sell";

    return {
        time: openedTime,
        position: isLong ? "belowBar" : "aboveBar",
        color,
        shape: isLong ? "arrowUp" : "arrowDown",
        text: `${sideLabel} @ ${formatPrice(position.entry_price)}`,
    };
}

function buildCloseMarker(
    position: Position,
    longColor: string,
    shortColor: string
): SeriesMarker<Time> | undefined {
    const closedTime = toChartTime(position.closed_at);
    if (!closedTime) {
        return undefined;
    }

    const isLong = position.side === "BUY";
    const color = isLong ? longColor : shortColor;
    const sideLabel = isLong ? "Buy" : "Sell";
    const exitPrice = position.exit_price ?? position.entry_price;

    return {
        time: closedTime,
        position: isLong ? "aboveBar" : "belowBar",
        color,
        shape: "circle",
        text: `${sideLabel} close @ ${formatPrice(exitPrice)}`,
    };
}

function toChartTime(timestamp?: string | null): Time | undefined {
    if (!timestamp) {
        return undefined;
    }

    const ms = Date.parse(timestamp);
    if (Number.isNaN(ms)) {
        return undefined;
    }

    return Math.floor(ms / 1000) as Time;
}
