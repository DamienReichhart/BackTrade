import { type User, type Prisma, usersRepo } from "@backtrade/datas";
import usersCacheService from "../cache/users-cache-service";
import { logger } from "../../libs/pino";
import NotFoundError from "../../errors/web/not-found-error";
import AlreadyExistsError from "../../errors/web/already-exists-error";

/**
 * Users Service
 *
 * Handles business logic for user operations including CRUD and caching.
 */
class UsersService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "user-service",
        });
    }

    /**
     * Check if an email is available for registration
     *
     * @param email - Email address to check
     * @returns True if email is available, false otherwise
     */
    async isUserEmailAvailable(email: string): Promise<boolean> {
        const user = await usersRepo.getUserByEmail(email);
        return user ? false : true;
    }

    /**
     * Get a user by ID with caching
     *
     * @param id - User ID
     * @returns User entity
     * @throws NotFoundError if user doesn't exist
     */
    async getUserById(id: number): Promise<User> {
        const cachedUser = await usersCacheService.getCachedUser(id);
        if (cachedUser) {
            this.logger.trace({ id }, "User found in cache");
            return cachedUser;
        }
        this.logger.trace(
            { id },
            "User not found in cache, fetching from database"
        );
        const user = await usersRepo.getUserById(id);
        if (!user) {
            this.logger.debug(
                { id },
                "User not found, throwing not found error"
            );
            throw new NotFoundError("User not found");
        }
        await usersCacheService.cacheUser(id, user);
        this.logger.trace({ id }, "User cached");
        return user;
    }

    /**
     * Create a new user
     *
     * @param data - User creation data
     * @returns Created user entity
     * @throws AlreadyExistsError if email is already in use
     */
    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        const isEmailAvailable = await this.isUserEmailAvailable(data.email);
        if (!isEmailAvailable) {
            this.logger.debug(
                { email: data.email },
                "Email already in use, throwing already exists error"
            );
            throw new AlreadyExistsError("Email already in use");
        }
        const user = await usersRepo.createUser(data);
        this.logger.debug({ id: user.id }, "User created");
        await usersCacheService.cacheUser(user.id, user);
        this.logger.trace({ id: user.id }, "User cached");
        return user;
    }

    /**
     * Update an existing user
     *
     * @param id - User ID
     * @param data - User update data
     * @returns Updated user entity
     * @throws NotFoundError if user doesn't exist
     * @throws AlreadyExistsError if new email is already in use
     */
    async updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
        const existingUser = await usersRepo.getUserById(id);
        if (!existingUser) {
            this.logger.debug(
                { id },
                "User not found, throwing not found error"
            );
            throw new NotFoundError("User not found");
        }
        if (existingUser.email !== data.email) {
            const existingUserByEmail = await usersRepo.getUserByEmail(
                data.email as string
            );
            if (existingUserByEmail) {
                this.logger.debug(
                    { email: data.email },
                    "User already exists, throwing already exists error"
                );
                throw new AlreadyExistsError("User already exists");
            }
        }
        const user = await usersRepo.updateUser(id, data);
        this.logger.debug({ id: user.id }, "User updated");
        await usersCacheService.cacheUser(id, user);
        this.logger.trace({ id: user.id }, "User cached");
        return user;
    }

    /**
     * Delete a user
     *
     * @param id - User ID
     * @throws NotFoundError if user doesn't exist
     */
    async deleteUser(id: number): Promise<void> {
        const existingUser = await usersRepo.getUserById(id);
        if (!existingUser) {
            this.logger.debug(
                { id },
                "User not found, throwing not found error"
            );
            throw new NotFoundError("User not found");
        }
        await usersRepo.deleteUser(id);
        this.logger.debug({ id }, "User deleted");
        await usersCacheService.invalidateCachedUser(id);
        this.logger.trace({ id }, "User invalidated from cache");
    }

    /**
     * Get all users with optional filtering
     *
     * @param where - Optional Prisma where clause
     * @returns Array of user entities
     */
    async getAllUsers(where?: Prisma.UserWhereInput): Promise<User[]> {
        const users = await usersRepo.getAllUsers(where);
        this.logger.trace({ users }, "Users fetched");
        return users;
    }

    /**
     * Get a user by email address
     *
     * @param email - Email address
     * @returns User entity
     * @throws NotFoundError if user doesn't exist
     */
    async getUserByEmail(email: string): Promise<User> {
        const user = await usersRepo.getUserByEmail(email);
        if (!user) {
            this.logger.debug(
                { email },
                "User not found, throwing not found error"
            );
            throw new NotFoundError("User not found");
        }
        this.logger.trace({ email }, "User fetched");
        return user;
    }
}

export default new UsersService();
