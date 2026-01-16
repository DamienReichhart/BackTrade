import { z } from "zod";
import type { TimeframeSchema } from "@backtrade/types";

/**
 * Dataset form schema for client-side validation.
 * Uses z.string() for timeframe to allow empty initial state,
 * then validates against TimeframeSchema.
 */
export const CreateDatasetFormSchema = z.object({
    instrument_id: z.string().min(1, "Instrument is required"),
    timeframe: z.string().min(1, "Timeframe is required"),
});

export type DatasetFormState = z.infer<typeof CreateDatasetFormSchema>;

/**
 * Validated dataset form state (after validation passes)
 */
export interface ValidatedDatasetFormState {
    instrument_id: string;
    timeframe: z.infer<typeof TimeframeSchema>;
}
