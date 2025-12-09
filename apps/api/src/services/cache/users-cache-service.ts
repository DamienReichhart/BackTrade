import { createCacheService } from "./cache-service-factory";
import type { User } from "../../generated/prisma/client";
import { UserSchema } from "@backtrade/types";

const userCacheService = createCacheService<User>({
    prefix: "user:",
    ttl: 60 * 10, // 10 minutes
    entityName: "user",
    entitySchema: UserSchema,
});

// Export with backward-compatible method names
export default {
    cacheUser: userCacheService.cache,
    getCachedUser: userCacheService.get,
    invalidateCachedUser: userCacheService.invalidate,
};
