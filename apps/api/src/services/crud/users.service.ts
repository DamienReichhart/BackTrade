import type { User, Prisma } from "../../generated/prisma/client";
import usersRepo from "../../repositories/users.repository";
import usersCacheService from "../cache/users.cache.service";
import { logger } from "../../libs/pino";

const userServiceLogger = logger.child({
  service: "user-service",
});

async function getUserById(id: number): Promise<User | null> {
  const cachedUser = await usersCacheService.getCachedUser(id);
  if (cachedUser) {
    userServiceLogger.trace({ id }, "User found in cache");
    return cachedUser;
  }
  userServiceLogger.trace({ id }, "User not found in cache, fetching from database");
  const user = await usersRepo.getUserById(id);
  if (user) {
    await usersCacheService.cacheUser(id, user);
    userServiceLogger.trace({ id }, "User cached");
  }
  return user;
}

async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  const user = await usersRepo.createUser(data);
  userServiceLogger.trace({ id: user.id }, "User created");
  await usersCacheService.cacheUser(user.id, user);
  userServiceLogger.trace({ id: user.id }, "User cached");
  return user;
}

async function updateUser(
  id: number,
  data: Prisma.UserUpdateInput,
): Promise<User> {
  const user = await usersRepo.updateUser(id, data);
  userServiceLogger.trace({ id: user.id }, "User updated");
  await usersCacheService.cacheUser(id, user);
  userServiceLogger.trace({ id: user.id }, "User cached");
  return user;
}

async function deleteUser(id: number): Promise<void> {
  await usersRepo.deleteUser(id);
  userServiceLogger.trace({ id }, "User deleted");
  await usersCacheService.invalidateCachedUser(id);
  userServiceLogger.trace({ id }, "User invalidated from cache");
}

async function getAllUsers(where?: Prisma.UserWhereInput): Promise<User[]> {
  const users = await usersRepo.getAllUsers(where);
  userServiceLogger.trace({ users }, "Users fetched");
  return users;
}

export default {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
};
