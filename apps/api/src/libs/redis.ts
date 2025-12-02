import Redis from "ioredis";
import { ENV } from "../config/env";
import { logger } from "./pino";

const redisLogger = logger.child({
    service: "redis",
});

export const redis = new Redis({
    host: ENV.REDIS_HOST,
    port: ENV.REDIS_PORT,
    maxRetriesPerRequest: null,
    password: ENV.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000); // 50ms * times, max 2000ms
        return delay;
    },
    reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    },
});

redis.on("error", (err) => {
    redisLogger.error({ err }, "Connection error");
});

redis.on("connect", () => {
    redisLogger.info("Connected successfully");
});

redis.on("ready", () => {
    redisLogger.info("Ready to accept commands");
});

redis.on("close", () => {
    redisLogger.info("Connection closed");
});

redis.on("reconnecting", (delay: string) => {
    redisLogger.info({ delay }, "Reconnecting");
});
