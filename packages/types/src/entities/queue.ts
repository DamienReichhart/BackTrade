import { z } from "zod";
import { JobStatusSchema } from "../enums/queue";

/**
 * Queue message structure
 *
 * Represents a message that can be queued for processing by workers.
 * This is a shared schema used by both the API (for queuing) and Worker (for processing).
 */
export interface QueueMessage {
    id: string;
    type: string;
    data: unknown;
    timestamp: string;
}

/**
 * QueueJob entity schema
 *
 * Represents a job stored in the database queue_jobs table.
 * This is used for tracking and managing background jobs.
 */
export const QueueJobSchema = z.object({
    id: z.number().int().positive(),
    type: z.string(),
    status: JobStatusSchema,
    payload: z.unknown(), // JSON payload stored as unknown for flexibility
    error: z.string().optional().nullable(),
    retry_count: z.number().int().nonnegative().default(0),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
    processed_at: z.coerce.date().optional().nullable(),
});

export type QueueJob = z.infer<typeof QueueJobSchema>;
