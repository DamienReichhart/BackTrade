import { useEffect, type RefObject } from "react";
import type {
    ISeriesMarkersPluginApi,
    SeriesMarker,
    Time,
} from "lightweight-charts";

/**
 * Synchronize computed markers with the candlestick series.
 *
 * @param markersPluginRef - Reference to the markers plugin attached to the series
 * @param markers - Markers to render
 * @param isReady - Whether the series and plugin have been initialized
 */
export function useChartMarkers(
    markersPluginRef: RefObject<ISeriesMarkersPluginApi<Time> | null>,
    markers: SeriesMarker<Time>[],
    isReady: boolean
) {
    useEffect(() => {
        if (!isReady || !markersPluginRef.current) {
            return;
        }

        markersPluginRef.current.setMarkers(markers);
    }, [markersPluginRef, markers, isReady]);
}
