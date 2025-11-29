import { type Health } from "@backtrade/types";
import { prisma } from "../../libs/prisma";
import { redis } from "../../libs/redis";

/**
 * Checks database connectivity by executing a simple query
 * @returns Promise resolving to "connected" or "error"
 */
async function checkDatabase(): Promise<"connected" | "error"> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "connected";
  } catch {
    return "error";
  }
}

/**
 * Checks Redis connectivity by executing a PING command
 * @returns Promise resolving to "connected" or "error"
 */
async function checkRedis(): Promise<"connected" | "error"> {
  try {
    await redis.ping();
    return "connected";
  } catch {
    return "error";
  }
}

async function getHealth(): Promise<Health> {

  const [database, redisStatus] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);

  return {
    status: "ok",
    time: new Date().toISOString(),
    database,
    redis: redisStatus,
  };
}

export default {
  getHealth,
};
