import { type Health, type SingleServiceHealthStatus } from "@backtrade/types";
import healthCacheService from "../cache/health-cache-service";
import { prisma } from "@backtrade/datas";
import { redis } from "../../libs/redis";
import { checkConnection as checkRabbitMQConnection } from "../../libs/rabbitmq";

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
     * Checks RabbitMQ connectivity
     *
     * @returns Promise resolving to "ok" or "error"
     */
    private async checkRabbitMQ(): Promise<SingleServiceHealthStatus> {
        try {
            const isConnected = await checkRabbitMQConnection();
            return isConnected ? "ok" : "error";
        } catch {
            return "error";
        }
    }

    /**
     * Get overall system health status
     *
     * Checks database, Redis, SMTP, and RabbitMQ connectivity with caching.
     * @returns Health status object
     */
    async getHealth(): Promise<Health> {
        const cachedHealth = await healthCacheService.getCachedHealth(1);
        if (cachedHealth) {
            return cachedHealth;
        }
        const [database, redisStatus, rabbitmqStatus] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
            this.checkRabbitMQ(),
        ]);

        const healthResult: Health = {
            status: "ok",
            time: new Date().toISOString(),
            database,
            redis: redisStatus,
            rabbitmq: rabbitmqStatus,
        };

        await healthCacheService.cacheHealth(1, healthResult);

        return healthResult;
    }
}

export default new HealthService();
