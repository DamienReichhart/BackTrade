import Redis from "ioredis";
import { ENV } from "../config/env";

export const redis = new Redis({
    host: ENV.REDIS_HOST,
    port: ENV.REDIS_PORT,
    maxRetriesPerRequest: null,
    password: ENV.REDIS_PASSWORD,
});
