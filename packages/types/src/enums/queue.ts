import { z } from "zod";

/**
 * JobStatus enum schema
 *
 * Represents the possible states of a queue job.
 */
export const JobStatusSchema = z.enum([
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
    "RETRYING",
]);
export type JobStatus = z.infer<typeof JobStatusSchema>;
