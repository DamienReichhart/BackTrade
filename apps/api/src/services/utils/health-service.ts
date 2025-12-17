import { type Health, type SingleServiceHealthStatus } from "@backtrade/types";
import { healthCacheRepo } from "../../libs/cache";
import { prisma } from "@backtrade/datas";
import { redis } from "../../libs/redis";
import { checkConnection as checkRabbitMQConnection } from "../../libs/rabbitmq";
import { mailerService } from "../../libs/mailer";
import { storageService } from "../../libs/storage";

/**
 * Health Service
 *
 * Handles health check operations for various system components.
 */
class HealthService {
    /**
     * Checks database connectivity by executing a simple query
     *
     * @returns Promise resolving to "ok" or "error"
     */
    private async checkDatabase(): Promise<SingleServiceHealthStatus> {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return "ok";
        } catch {
            return "error";
        }
    }

    /**
     * Checks Redis connectivity by executing a PING command
     *
     * @returns Promise resolving to "ok" or "error"
     */
    private async checkRedis(): Promise<SingleServiceHealthStatus> {
        try {
            await redis.ping();
            return "ok";
        } catch {
            return "error";
        }
    }

    /**
     * Checks queuing (RabbitMQ) connectivity
     *
     * @returns Promise resolving to "ok" or "error"
     */
    private async checkQueuing(): Promise<SingleServiceHealthStatus> {
        try {
            const isConnected = await checkRabbitMQConnection();
            return isConnected ? "ok" : "error";
        } catch {
            return "error";
        }
    }

    /**
     * Checks mailer (SMTP) connectivity
     *
     * @returns Promise resolving to "ok" or "error"
     */
    private async checkMailer(): Promise<SingleServiceHealthStatus> {
        try {
            const isConnected = await mailerService.checkConnection();
            return isConnected ? "ok" : "error";
        } catch {
            return "error";
        }
    }

    /**
     * Checks storage (MinIO) connectivity
     *
     * @returns Promise resolving to "ok" or "error"
     */
    private async checkStorage(): Promise<SingleServiceHealthStatus> {
        try {
            const isConnected = await storageService.checkConnection();
            return isConnected ? "ok" : "error";
        } catch {
            return "error";
        }
    }

    /**
     * Get overall system health status
     *
     * Checks database, Redis, queuing, mailer, and storage connectivity with caching.
     * @returns Health status object
     */
    async getHealth(): Promise<Health> {
        const cachedHealth = await healthCacheRepo.getCachedHealth(1);
        if (cachedHealth) {
            return cachedHealth;
        }
        const [
            database,
            redisStatus,
            queuingStatus,
            mailerStatus,
            storageStatus,
        ] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
            this.checkQueuing(),
            this.checkMailer(),
            this.checkStorage(),
        ]);

        const healthResult: Health = {
            status: "ok",
            time: new Date().toISOString(),
            database,
            redis: redisStatus,
            queuing: queuingStatus,
            mailer: mailerStatus,
            storage: storageStatus,
        };

        await healthCacheRepo.cacheHealth(1, healthResult);

        return healthResult;
    }
}

export default new HealthService();
