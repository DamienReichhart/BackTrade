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
    "QUEUE_FAILED",
    "PERMANENTLY_FAILED",
]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

/**
 * QueueName enum values
 *
 * Provides enum-like access to queue name values.
 */
export const QueueName = {
    dataProcessing: "dataProcessing" as const,
    datasetFileSplit: "datasetFileSplit" as const,
    datasetPartProcess: "datasetPartProcess" as const,
    mail: "mail" as const,
} as const;

/**
 * QueueName type
 *
 * Represents the possible queue names for queue jobs.
 */
export type QueueName = (typeof QueueName)[keyof typeof QueueName];

/**
 * QueueName enum schema
 *
 * Zod schema for validating queue names.
 */
export const QueueNameSchema = z.enum([
    QueueName.dataProcessing,
    QueueName.datasetFileSplit,
    QueueName.datasetPartProcess,
    QueueName.mail,
]);
