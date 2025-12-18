/**
 * Queue Jobs Repository
 *
 * Data access layer for QueueJob model operations.
 * Provides CRUD operations and specialized queries for managing queue jobs.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    QueueJob,
    QueueJobWhereInput,
    QueueJobCreateInput,
    QueueJobUpdateInput,
    QueueJobOrderBy,
    JobStatus,
    QueueName,
} from "@backtrade/types";
import { BasePostgresRepository } from "./base-repository";

/**
 * Repository for QueueJob model CRUD operations and specialized queries.
 */
class QueueJobsRepository extends BasePostgresRepository {
    /**
     * Get all queue jobs matching optional filter conditions.
     *
     * @param where - Optional filter conditions
     * @param orderBy - Optional sorting criteria
     * @param limit - Optional limit on number of results
     * @returns Array of matching queue jobs
     */
    async getAllQueueJobs(
        where?: QueueJobWhereInput,
        orderBy?: QueueJobOrderBy,
        limit?: number
    ): Promise<QueueJob[]> {
        return this.prisma.queueJob.findMany({
            where: where as Prisma.QueueJobWhereInput,
            orderBy: orderBy as
                | Prisma.QueueJobOrderByWithRelationInput
                | undefined,
            take: limit,
        }) as unknown as QueueJob[];
    }

    /**
     * Get a queue job by ID.
     *
     * @param id - Queue job ID as number or string
     * @returns Queue job entity or null if not found
     */
    async getQueueJobById(id: number | string): Promise<QueueJob | null> {
        return this.prisma.queueJob.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as QueueJob | null;
    }

    /**
     * Create a new queue job.
     *
     * @param data - Queue job creation data
     * @returns Created queue job entity
     */
    async createQueueJob(data: QueueJobCreateInput): Promise<QueueJob> {
        return this.prisma.queueJob.create({
            data: data as Prisma.QueueJobCreateInput,
        }) as unknown as QueueJob;
    }

    /**
     * Update an existing queue job.
     *
     * @param id - Queue job ID as number or string
     * @param data - Queue job update data
     * @returns Updated queue job entity
     */
    async updateQueueJob(
        id: number | string,
        data: QueueJobUpdateInput
    ): Promise<QueueJob> {
        return this.prisma.queueJob.update({
            where: { id: this.toNumericId(id) },
            data: data as Prisma.QueueJobUpdateInput,
        }) as unknown as QueueJob;
    }

    /**
     * Delete a queue job by ID.
     *
     * @param id - Queue job ID as number or string
     * @returns Deleted queue job entity
     */
    async deleteQueueJob(id: number | string): Promise<QueueJob> {
        return this.prisma.queueJob.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as QueueJob;
    }

    /**
     * Get queue jobs by status.
     *
     * @param status - Job status to filter by
     * @param orderBy - Optional sorting criteria
     * @param limit - Optional limit on number of results
     * @returns Array of queue jobs with the specified status
     */
    async getQueueJobsByStatus(
        status: JobStatus,
        orderBy?: QueueJobOrderBy,
        limit?: number
    ): Promise<QueueJob[]> {
        return this.getAllQueueJobs(
            { status: { equals: status } },
            orderBy,
            limit
        );
    }

    /**
     * Get queue jobs by type.
     *
     * @param type - Job type to filter by
     * @param orderBy - Optional sorting criteria
     * @param limit - Optional limit on number of results
     * @returns Array of queue jobs with the specified type
     */
    async getQueueJobsByType(
        type: QueueName,
        orderBy?: QueueJobOrderBy,
        limit?: number
    ): Promise<QueueJob[]> {
        return this.getAllQueueJobs(
            { type: { equals: type } as QueueJobWhereInput["type"] },
            orderBy,
            limit
        );
    }

    /**
     * Get pending queue jobs, ordered by creation date (oldest first).
     *
     * @param limit - Optional limit on number of results
     * @returns Array of pending queue jobs
     */
    async getPendingQueueJobs(limit?: number): Promise<QueueJob[]> {
        return this.getQueueJobsByStatus(
            "PENDING",
            { created_at: "asc" },
            limit
        );
    }

    /**
     * Get failed queue jobs that can be retried.
     *
     * @param maxRetries - Maximum number of retries allowed
     * @param orderBy - Optional sorting criteria
     * @param limit - Optional limit on number of results
     * @returns Array of failed queue jobs that haven't exceeded max retries
     */
    async getRetryableQueueJobs(
        maxRetries: number = 3,
        orderBy?: QueueJobOrderBy,
        limit?: number
    ): Promise<QueueJob[]> {
        return this.getAllQueueJobs(
            {
                status: { equals: "FAILED" },
                retry_count: { lt: maxRetries },
            },
            orderBy ?? { created_at: "asc" },
            limit
        );
    }

    /**
     * Mark a queue job as processing.
     *
     * @param id - Queue job ID as number or string
     * @returns Updated queue job entity
     */
    async markAsProcessing(id: number | string): Promise<QueueJob> {
        return this.updateQueueJob(id, {
            status: "PROCESSING",
        });
    }

    /**
     * Mark a queue job as completed.
     *
     * @param id - Queue job ID as number or string
     * @returns Updated queue job entity
     */
    async markAsCompleted(id: number | string): Promise<QueueJob> {
        return this.updateQueueJob(id, {
            status: "COMPLETED",
            processed_at: new Date(),
        });
    }

    /**
     * Mark a queue job as failed.
     *
     * @param id - Queue job ID as number or string
     * @param error - Error message or details
     * @returns Updated queue job entity
     */
    async markAsFailed(id: number | string, error: string): Promise<QueueJob> {
        return this.updateQueueJob(id, {
            status: "FAILED",
            error,
            processed_at: new Date(),
        });
    }

    /**
     * Mark a queue job as queue failed.
     *
     * This status indicates that the QueueJob was created in the database
     * but failed to be published to RabbitMQ.
     *
     * @param id - Queue job ID as number or string
     * @param error - Error message or details
     * @returns Updated queue job entity
     */
    async markAsQueueFailed(
        id: number | string,
        error: string
    ): Promise<QueueJob> {
        return this.updateQueueJob(id, {
            status: "QUEUE_FAILED",
            error,
        });
    }

    /**
     * Increment retry count and mark as retrying.
     *
     * @param id - Queue job ID as number or string
     * @returns Updated queue job entity
     */
    async incrementRetry(id: number | string): Promise<QueueJob> {
        const job = await this.getQueueJobById(id);
        if (!job) {
            throw new Error(`Queue job with id ${id} not found`);
        }

        return this.updateQueueJob(id, {
            status: "RETRYING",
            retry_count: job.retry_count + 1,
            error: null, // Clear error when retrying
        });
    }

    /**
     * Reset a queue job to pending status (useful for manual retries).
     *
     * @param id - Queue job ID as number or string
     * @returns Updated queue job entity
     */
    async resetToPending(id: number | string): Promise<QueueJob> {
        return this.updateQueueJob(id, {
            status: "PENDING",
            error: null,
            processed_at: null,
        });
    }

    /**
     * Get queue jobs created within a date range.
     *
     * @param startDate - Start date (inclusive)
     * @param endDate - End date (inclusive)
     * @param orderBy - Optional sorting criteria
     * @param limit - Optional limit on number of results
     * @returns Array of queue jobs created in the date range
     */
    async getQueueJobsByDateRange(
        startDate: Date,
        endDate: Date,
        orderBy?: QueueJobOrderBy,
        limit?: number
    ): Promise<QueueJob[]> {
        return this.prisma.queueJob.findMany({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: (orderBy ?? { created_at: "desc" }) as
                | Prisma.QueueJobOrderByWithRelationInput
                | undefined,
            take: limit,
        }) as unknown as QueueJob[];
    }

    /**
     * Count queue jobs matching optional filter conditions.
     *
     * @param where - Optional filter conditions
     * @returns Number of matching queue jobs
     */
    async countQueueJobs(where?: QueueJobWhereInput): Promise<number> {
        return this.prisma.queueJob.count({
            where: where as Prisma.QueueJobWhereInput,
        });
    }

    /**
     * Delete old completed queue jobs (cleanup operation).
     *
     * @param olderThan - Delete jobs completed before this date
     * @returns Number of deleted jobs
     */
    async deleteOldCompletedJobs(olderThan: Date): Promise<number> {
        const result = await this.prisma.queueJob.deleteMany({
            where: {
                status: "COMPLETED",
                processed_at: {
                    lt: olderThan,
                },
            },
        });
        return result.count;
    }

    /**
     * Delete old failed queue jobs that exceeded max retries (cleanup operation).
     *
     * @param maxRetries - Maximum number of retries before deletion
     * @param olderThan - Delete jobs failed before this date
     * @returns Number of deleted jobs
     */
    async deleteOldFailedJobs(
        maxRetries: number,
        olderThan: Date
    ): Promise<number> {
        const result = await this.prisma.queueJob.deleteMany({
            where: {
                status: "FAILED",
                retry_count: {
                    gte: maxRetries,
                },
                updated_at: {
                    lt: olderThan,
                },
            },
        });
        return result.count;
    }
}

const queueJobsRepo = new QueueJobsRepository();

export default queueJobsRepo;
