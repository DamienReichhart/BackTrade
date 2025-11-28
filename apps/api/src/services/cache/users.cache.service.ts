import type { User } from "../../generated/prisma/client";
import { redis } from "../../libs/redis";

const PREFIX = "user:";
const TTL = 60 * 5; // 5 min

async function cacheUser(userId: number, data: User) {
  try {
    await redis.set(PREFIX + userId, JSON.stringify(data), "EX", TTL);
  } catch (error) {
    console.error("Error caching user:", error);
    throw error;
  }
}

async function getCachedUser(userId: number): Promise<User | null> {
  try {
    const result = await redis.get(PREFIX + userId);
    return result ? JSON.parse(result) as User : null;
  } catch (error) {
    console.error("Error getting cached user:", error);
    throw error;
  }
}

async function invalidateCachedUser(userId: number): Promise<void> {
  try {
    await redis.del(PREFIX + userId);
  } catch (error) {
    console.error("Error clearing cached user:", error);
    throw error;
  }
}

export default {
  cacheUser,
  getCachedUser,
  invalidateCachedUser,
};