import { type Health, type SingleServiceHealthStatus } from "@backtrade/types";
import healthCacheService from "../cache/health-cache-service";
import { prisma } from "@backtrade/datas";
import { redis } from "../../libs/redis";
import mailerService from "./mailer-service";

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
     * Checks SMTP connectivity
     *
     * @returns Promise resolving to "ok" or "error"
     */
    private async checkSMTP(): Promise<SingleServiceHealthStatus> {
        try {
            const isConnected = await mailerService.checkConnection();
            return isConnected ? "ok" : "error";
        } catch {
            return "error";
        }
    }

    /**
     * Get overall system health status
     *
     * Checks database, Redis, and SMTP connectivity with caching.
     * @returns Health status object
     */
    async getHealth(): Promise<Health> {
        const cachedHealth = await healthCacheService.getCachedHealth(1);
        if (cachedHealth) {
            return cachedHealth;
        }
        const [database, redisStatus, smtpStatus] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
            this.checkSMTP(),
        ]);

        const healthResult: Health = {
            status: "ok",
            time: new Date().toISOString(),
            database,
            redis: redisStatus,
            smtp: smtpStatus,
        };

        await healthCacheService.cacheHealth(1, healthResult);

        return healthResult;
    }
}

export default new HealthService();
