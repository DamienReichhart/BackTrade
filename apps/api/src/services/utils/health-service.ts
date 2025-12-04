import { type Health, type SingleServiceHealthStatus } from "@backtrade/types";
import { prisma } from "../../libs/prisma";
import { redis } from "../../libs/redis";
import mailerService from "./mailer-service";

/**
 * Checks database connectivity by executing a simple query
 * @returns Promise resolving to "connected" or "error"
 */
async function checkDatabase(): Promise<SingleServiceHealthStatus> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return "ok";
    } catch {
        return "error";
    }
}

/**
 * Checks Redis connectivity by executing a PING command
 * @returns Promise resolving to "connected" or "error"
 */
async function checkRedis(): Promise<SingleServiceHealthStatus> {
    try {
        await redis.ping();
        return "ok";
    } catch {
        return "error";
    }
}

async function checkSMTP(): Promise<SingleServiceHealthStatus> {
    if (await mailerService.checkConnection()) {
        return "ok";
    } else {
        return "error";
    }
}

async function getHealth(): Promise<Health> {
    const [database, redisStatus, smtpStatus] = await Promise.all([
        checkDatabase(),
        checkRedis(),
        checkSMTP(),
    ]);

    return {
        status: "ok",
        time: new Date().toISOString(),
        database,
        redis: redisStatus,
        smtp: smtpStatus,
    };
}

export default {
    getHealth,
};
