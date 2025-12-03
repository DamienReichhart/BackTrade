import { useGet } from "..";
import {
    InstrumentSchema,
    InstrumentListResponseSchema,
    type SearchQuery,
} from "@backtrade/types";

/**
 * Instrument Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function useInstruments(query?: SearchQuery) {
    const searchParams = new URLSearchParams();
    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        });
    }

    const url = query
        ? `/instruments?${searchParams.toString()}`
        : "/instruments";

    return useGet(url, InstrumentListResponseSchema);
}

export function useInstrument(id: string) {
    return useGet(`/instruments/${id}`, InstrumentSchema, { enabled: !!id });
}
