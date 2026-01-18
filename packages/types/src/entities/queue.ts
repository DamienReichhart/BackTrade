import { z } from "zod";
import {
    JobStatusSchema,
    QueueNameSchema,
    type QueueName,
} from "../enums/queue";

/**
 * Queue job message structure
 *
 * Represents a message sent to RabbitMQ that references a QueueJob in the database.
 * The worker will fetch the full job data from the database using the queueJobId.
 */
export interface QueueJobMessage {
    type: QueueName;
    queueJobId: number;
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
    type: QueueNameSchema,
    status: JobStatusSchema,
    payload: z.unknown(), // JSON payload stored as unknown for flexibility
    error: z.string().optional().nullable(),
    retry_count: z.number().int().nonnegative().default(0),
    next_attempt_at: z.coerce.date().optional().nullable(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
    processed_at: z.coerce.date().optional().nullable(),
});

export type QueueJob = z.infer<typeof QueueJobSchema>;
