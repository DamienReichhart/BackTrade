import type { User } from "../../generated/prisma/client";
import { createCacheService } from "../../core/factories/cache.service.factory";

const userCacheService = createCacheService<User>({
  prefix: "user:",
  ttl: 60 * 10, // 10 minutes
  entityName: "user",
});

// Export with backward-compatible method names
export default {
  cacheUser: userCacheService.cache,
  getCachedUser: userCacheService.get,
  invalidateCachedUser: userCacheService.invalidate,
};
