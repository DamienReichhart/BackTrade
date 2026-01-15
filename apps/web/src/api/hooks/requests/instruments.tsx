import { useDelete, useGet, usePatch, usePost } from "..";
import {
    CreateInstrumentRequestSchema,
    InstrumentSchema,
    InstrumentListResponseSchema,
    type SearchQuery,
    UpdateInstrumentRequestSchema,
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
    // Validate that ID is not empty, not "0", and is a valid positive number
    const isValidId =
        !!id && id !== "0" && !isNaN(Number(id)) && Number(id) > 0;
    return useGet(`/instruments/${id}`, InstrumentSchema, {
        enabled: isValidId,
    });
}

export function useCreateInstrument() {
    return usePost(
        "/instruments",
        CreateInstrumentRequestSchema,
        InstrumentSchema
    );
}

export function useUpdateInstrument(id: string) {
    return usePatch(
        `/instruments/${id}`,
        UpdateInstrumentRequestSchema,
        InstrumentSchema
    );
}

export function useDeleteInstrument(id: string) {
    return useDelete(`/instruments/${id}`);
}
