/**
 * Dataset Processing Types
 *
 * Types for dataset file processing queue job payloads.
 */

import { z } from "zod";
import { TimeframeSchema } from "../enums";

/**
 * Payload for the datasetFileSplit queue job.
 *
 * This job is created when a file is uploaded and needs to be split
 * into smaller parts for parallel processing.
 */
export const DatasetFileSplitPayloadSchema = z.object({
    /** ID of the dataset being processed */
    datasetId: z.number().int().positive(),
    /** Path to the raw file in MinIO (e.g., "datasets/1/raw/file.csv") */
    filePath: z.string(),
    /** Instrument ID for the candles */
    instrumentId: z.number().int().positive(),
    /** Timeframe for the candles */
    timeframe: TimeframeSchema,
});
export type DatasetFileSplitPayload = z.infer<
    typeof DatasetFileSplitPayloadSchema
>;

/**
 * Payload for the datasetPartProcess queue job.
 *
 * This job is created for each part of a split file,
 * to be processed and inserted into the database.
 */
export const DatasetPartProcessPayloadSchema = z.object({
    /** ID of the dataset being processed */
    datasetId: z.number().int().positive(),
    /** Path to the part file in MinIO (e.g., "datasets/1/parts/part_0.csv") */
    partPath: z.string(),
    /** Part number (0-indexed) */
    partNumber: z.number().int().nonnegative(),
    /** Total number of parts */
    totalParts: z.number().int().positive(),
    /** Instrument ID for the candles */
    instrumentId: z.number().int().positive(),
    /** Timeframe for the candles */
    timeframe: TimeframeSchema,
});
export type DatasetPartProcessPayload = z.infer<
    typeof DatasetPartProcessPayloadSchema
>;
