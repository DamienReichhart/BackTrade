import { usersRepo } from "@backtrade/data";
import type {
    User,
    UserWhereInput,
    UserCreateInput,
    UserUpdateInput,
    UserOrderBy,
    SearchQueryUser,
} from "@backtrade/types";
import { usersCacheRepo } from "../../libs/cache";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import ForbiddenError from "../../errors/web/forbidden-error";
import AlreadyExistsError from "../../errors/web/already-exists-error";
import UnAuthenticatedError from "../../errors/web/unauthenticated-error";
import hashService from "../security/hash-service";
import emailNotificationService from "../notifications/email-notification-service";
import { validatePassword } from "@backtrade/utils";
import { BaseService } from "./base-service";
import { buildOrderBy, buildPagination } from "../../utils";
import { PAGINATION_CONSTANTS } from "../../config/trading-constants";

/**
 * Valid user roles
 */
const VALID_ROLES = ["USER", "ADMIN"] as const;

/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valid sortable fields for users
 */
const VALID_SORT_FIELDS = [
    "id",
    "email",
    "role",
    "is_banned",
    "created_at",
    "updated_at",
] as const;

type UserSortField = (typeof VALID_SORT_FIELDS)[number];

/**
 * Users Service
 *
 * Handles business logic for user operations including CRUD, validation, and caching.
 * Users represent registered accounts in the system.
 *
 * Authorization model:
 * - Users can access their own data
 * - Admins can access all user data
 * - Create/Update/Delete have specific permission rules
 */
class UsersService extends BaseService {
    constructor() {
        super("users-service");
    }

    // ============================================================================
    // VALIDATION METHODS
    // ============================================================================

    /**
     * Validate that email is provided and has valid format
     *
     * @param email - Email to validate
     * @throws BadRequestError if email is missing or invalid
     */
    private validateEmail(email: string | undefined | null): void {
        if (!email) {
            throw new BadRequestError("email is required");
        }
        if (!EMAIL_REGEX.test(email)) {
            throw new BadRequestError("Invalid email format");
        }
    }

    /**
     * Validate that password is provided
     *
     * @param password - Password to validate
     * @throws BadRequestError if password is missing
     */
    private validatePassword(password: string | undefined | null): void {
        if (!password) {
            throw new BadRequestError("password is required");
        }
    }

    /**
     * Validate that email is available for registration
     *
     * @param email - Email to check
     * @param excludeUserId - Optional user ID to exclude (for updates)
     * @throws AlreadyExistsError if email is already in use
     */
    private async validateEmailAvailability(
        email: string,
        excludeUserId?: number
    ): Promise<void> {
        const existingUser = await usersRepo.getUserByEmail(email);
        if (existingUser && existingUser.id !== excludeUserId) {
            this.logger.debug(
                { email, excludeUserId },
                "Email already in use, throwing already exists error"
            );
            throw new AlreadyExistsError("Email already in use");
        }
    }

    /**
     * Validate role is valid if provided
     *
     * @param role - Role to validate
     * @throws BadRequestError if role is invalid
     */
    private validateRole(role: string | undefined | null): void {
        if (role !== undefined && role !== null) {
            if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
                throw new BadRequestError(
                    `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`
                );
            }
        }
    }

    /**
     * Validate all business rules for user creation
     *
     * @param user - User creation data
     * @throws BadRequestError if validation fails
     * @throws AlreadyExistsError if email is already in use
     */
    private async validateUserCreation(user: UserCreateInput): Promise<void> {
        this.validateEmail(user.email);
        this.validatePassword(user.password_hash);
        this.validateRole(user.role);
        await this.validateEmailAvailability(user.email as string);
    }

    /**
     * Validate all business rules for user update
     *
     * @param user - User update data
     * @param existingUser - Existing user entity
     * @throws BadRequestError if validation fails
     * @throws AlreadyExistsError if email is already in use by another user
     */
    private async validateUserUpdate(
        user: UserUpdateInput,
        existingUser: User
    ): Promise<void> {
        // Validate email format if provided
        if (user.email !== undefined) {
            this.validateEmail(user.email);
            // Check email availability only if it's being changed
            if (user.email !== existingUser.email) {
                await this.validateEmailAvailability(
                    user.email as string,
                    existingUser.id
                );
            }
        }

        // Validate role if provided
        this.validateRole(user.role);
    }

    // ============================================================================
    // AUTHORIZATION METHODS
    // ============================================================================

    /**
     * Ensure user has access to view/modify a user account
     *
     * Users can only access their own data. Admins can access any user.
     *
     * @param targetUserId - ID of the user being accessed
     * @param requestingUser - User entity making the request
     * @throws ForbiddenError if user doesn't have access
     */
    private ensureUserAccess(targetUserId: number, requestingUser: User): void {
        if (
            targetUserId !== requestingUser.id &&
            requestingUser.role !== "ADMIN"
        ) {
            this.logger.debug(
                {
                    targetUserId,
                    requestingUserId: requestingUser.id,
                    requestingUserRole: requestingUser.role,
                },
                "User attempted to access another user's data"
            );
            throw new ForbiddenError(
                "You don't have permission to access this user"
            );
        }
    }

    /**
     * Ensure user has admin access for privileged operations
     *
     * @param user - User entity making the request
     * @param operation - Operation being performed (for logging)
     * @throws ForbiddenError if user is not admin
     */
    private ensureAdminAccess(user: User, operation: string): void {
        if (user.role !== "ADMIN") {
            this.logger.debug(
                {
                    userId: user.id,
                    userRole: user.role,
                    operation,
                },
                "Non-admin user attempted privileged operation"
            );
            throw new ForbiddenError(
                "Only administrators can perform this operation"
            );
        }
    }

    // ============================================================================
    // CACHE METHODS
    // ============================================================================

    /**
     * Get user from cache
     *
     * @param numericId - Numeric user ID
     * @returns Cached user or null if not found
     */
    private async getCachedUser(numericId: number): Promise<User | null> {
        const cachedUser = await usersCacheRepo.getCachedUser(numericId);
        if (cachedUser) {
            this.logger.trace({ id: numericId }, "User found in cache");
        }
        return cachedUser;
    }

    /**
     * Get user from cache with access verification
     *
     * @param numericId - Numeric user ID
     * @param requestingUser - User entity making the request
     * @returns Cached user or null if not found
     * @throws ForbiddenError if user doesn't have access
     */
    private async getCachedUserWithAccess(
        numericId: number,
        requestingUser: User
    ): Promise<User | null> {
        const cachedUser = await this.getCachedUser(numericId);
        if (!cachedUser) {
            return null;
        }

        this.ensureUserAccess(numericId, requestingUser);
        return cachedUser;
    }

    /**
     * Cache a user after retrieval
     *
     * @param user - User entity to cache
     */
    private async cacheUser(user: User): Promise<void> {
        await usersCacheRepo.cacheUser(user.id, user);
        this.logger.trace({ id: user.id }, "User cached");
    }

    /**
     * Invalidate a cached user
     *
     * @param id - User ID
     */
    private async invalidateCachedUser(id: number): Promise<void> {
        await usersCacheRepo.invalidateCachedUser(id);
        this.logger.trace({ id }, "User invalidated from cache");
    }

    // ============================================================================
    // PASSWORD HANDLING METHODS
    // ============================================================================

    /**
     * Hash a password for storage
     *
     * @param password - Plain text password
     * @returns Hashed password
     */
    private async hashPassword(password: string): Promise<string> {
        return hashService.hashPassword(password);
    }

    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

    /**
     * Check if an email is available for registration
     *
     * @param email - Email address to check
     * @returns True if email is available, false otherwise
     */
    async isUserEmailAvailable(email: string): Promise<boolean> {
        const user = await usersRepo.getUserByEmail(email);
        return !user;
    }

    /**
     * Get a user by ID with caching
     *
     * @param id - User ID (string from route params, converted internally)
     * @returns User entity
     * @throws NotFoundError if user doesn't exist
     */
    async getUserById(id: string | number): Promise<User> {
        const numericId = typeof id === "string" ? Number(id) : id;

        // Try to get from cache first
        const cachedUser = await this.getCachedUser(numericId);
        if (cachedUser) {
            return cachedUser;
        }

        // Fetch from database
        this.logger.trace(
            { id: numericId },
            "User not found in cache, fetching from database"
        );
        const user = await usersRepo.getUserById(numericId);
        if (!user) {
            this.logger.debug(
                { id: numericId },
                "User not found, throwing not found error"
            );
            throw new NotFoundError("User not found");
        }

        // Cache and return
        await this.cacheUser(user);
        return user;
    }

    /**
     * Get a user by ID with access verification
     *
     * @param id - User ID (string from route params, converted internally)
     * @param requestingUser - User entity making the request
     * @returns User entity
     * @throws NotFoundError if user doesn't exist
     * @throws ForbiddenError if user doesn't have access
     */
    async getUserByIdWithAccess(
        id: string | number,
        requestingUser: User
    ): Promise<User> {
        const numericId = typeof id === "string" ? Number(id) : id;

        // Try to get from cache first (includes access verification)
        const cachedUser = await this.getCachedUserWithAccess(
            numericId,
            requestingUser
        );
        if (cachedUser) {
            return cachedUser;
        }

        // Fetch from database
        this.logger.trace(
            { id: numericId },
            "User not found in cache, fetching from database"
        );
        const user = await usersRepo.getUserById(numericId);
        if (!user) {
            this.logger.debug(
                { id: numericId },
                "User not found, throwing not found error"
            );
            throw new NotFoundError("User not found");
        }

        // Verify access
        this.ensureUserAccess(numericId, requestingUser);

        // Cache and return
        await this.cacheUser(user);
        return user;
    }

    /**
     * Get a user by email address
     *
     * Used primarily for authentication - no access check needed.
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
        this.logger.trace({ email }, "User fetched by email");
        return user;
    }

    // ============================================================================
    // QUERY BUILDING METHODS
    // ============================================================================

    /**
     * Build search conditions for user queries
     *
     * @param searchQuery - Search query string (searches email)
     * @returns Where clause with search conditions or undefined
     */
    private buildSearchConditions(
        searchQuery: string
    ): UserWhereInput | undefined {
        if (!searchQuery) {
            return undefined;
        }

        return {
            email: {
                contains: searchQuery,
                mode: "insensitive" as const,
            },
        };
    }

    /**
     * Combine multiple where conditions with AND logic
     *
     * @param conditions - Array of where conditions to combine
     * @returns Combined where clause or undefined if empty
     */
    private combineWhereConditions(
        conditions: (UserWhereInput | undefined)[]
    ): UserWhereInput | undefined {
        const validConditions = conditions.filter(
            (c): c is UserWhereInput => c !== undefined
        );

        if (validConditions.length === 0) {
            return undefined;
        }

        if (validConditions.length === 1) {
            return validConditions[0];
        }

        return { AND: validConditions };
    }

    // ============================================================================
    // PUBLIC METHODS - USER LISTING
    // ============================================================================

    /**
     * Get all users with optional filtering
     *
     * Admin-only operation.
     *
     * @param requestingUser - User entity making the request
     * @param where - Optional where clause for filtering
     * @returns Array of user entities
     * @throws ForbiddenError if user is not admin
     */
    async getAllUsers(
        requestingUser: User,
        where?: UserWhereInput
    ): Promise<User[]> {
        // Check admin access
        this.ensureAdminAccess(requestingUser, "getAllUsers");

        // Execute query
        const users = await usersRepo.getAllUsers({ where });

        this.logger.trace({ count: users.length }, "Users fetched");
        return users;
    }

    /**
     * Get all users with search, filtering, sorting, and pagination
     *
     * Admin-only operation supporting:
     * - Text search (q) - searches email
     * - Role filter (role) - USER or ADMIN
     * - Banned status filter (is_banned) - true or false
     * - Sorting (sort, order) - by id, email, role, is_banned, created_at, updated_at
     * - Pagination (page, limit)
     *
     * @param requestingUser - User entity making the request
     * @param query - Search query parameters
     * @returns Array of user entities
     * @throws ForbiddenError if user is not admin
     */
    async getAllUsersWithFilters(
        requestingUser: User,
        query?: SearchQueryUser
    ): Promise<User[]> {
        // Check admin access
        this.ensureAdminAccess(requestingUser, "getAllUsersWithFilters");

        const {
            q,
            role,
            is_banned,
            page = PAGINATION_CONSTANTS.DEFAULT_PAGE,
            limit = PAGINATION_CONSTANTS.DEFAULT_PAGE_LIMIT,
            sort,
            order = "desc",
        } = query ?? {};

        // Build where conditions
        const searchConditions = this.buildSearchConditions(q ?? "");

        // Build role filter
        const roleCondition: UserWhereInput | undefined = role
            ? { role: { equals: role } }
            : undefined;

        // Build banned status filter
        const bannedCondition: UserWhereInput | undefined =
            is_banned !== undefined
                ? { is_banned: { equals: is_banned } }
                : undefined;

        // Combine all conditions
        const where = this.combineWhereConditions([
            searchConditions,
            roleCondition,
            bannedCondition,
        ]);

        // Build order by using shared utility
        const orderBy = buildOrderBy<UserSortField>(
            sort,
            order,
            VALID_SORT_FIELDS
        ) as UserOrderBy | undefined;

        // Build pagination using shared utility
        const { skip, take } = buildPagination(page, limit);

        this.logger.trace(
            { q, role, is_banned, page, limit, sort, order },
            "Fetching users with filters"
        );

        // Execute query
        const users = await usersRepo.getAllUsers({
            where,
            skip,
            take,
            orderBy,
        });

        this.logger.trace(
            { count: users.length },
            "Users fetched with filters"
        );
        return users;
    }

    /**
     * Create a new user
     *
     * Used by auth-service for registration.
     *
     * @param data - User creation data
     * @returns Created user entity
     * @throws BadRequestError if validation fails
     * @throws AlreadyExistsError if email is already in use
     */
    async createUser(data: UserCreateInput): Promise<User> {
        // Validate business rules
        await this.validateUserCreation(data);

        // Hash password
        const hashedPassword = await this.hashPassword(
            data.password_hash as string
        );
        const userData: UserCreateInput = {
            ...data,
            password_hash: hashedPassword,
        };

        this.logger.trace({ email: data.email }, "Creating user");

        const user = await usersRepo.createUser(userData);
        this.logger.debug({ id: user.id }, "User created");

        await this.cacheUser(user);
        return user;
    }

    /**
     * Update an existing user
     *
     * Users can update their own data. Admins can update any user.
     *
     * @param id - User ID (string from route params, converted internally)
     * @param data - User update data
     * @param requestingUser - User entity making the request
     * @returns Updated user entity
     * @throws NotFoundError if user doesn't exist
     * @throws ForbiddenError if user doesn't have access
     * @throws BadRequestError if validation fails
     * @throws AlreadyExistsError if email is already in use
     */
    async updateUser(
        id: string | number,
        data: UserUpdateInput,
        requestingUser: User
    ): Promise<User> {
        const numericId = typeof id === "string" ? Number(id) : id;

        // Check access
        this.ensureUserAccess(numericId, requestingUser);

        const existingUser = await usersRepo.getUserById(numericId);
        if (!existingUser) {
            this.logger.debug(
                { id: numericId },
                "User not found, throwing not found error"
            );
            throw new NotFoundError("User not found");
        }

        // Validate business rules
        await this.validateUserUpdate(data, existingUser);

        // Prepare update data
        const updateData: UserUpdateInput = { ...data };

        // Hash password if provided
        if (data.password_hash) {
            updateData.password_hash = await this.hashPassword(
                data.password_hash as string
            );
        }

        const user = await usersRepo.updateUser(numericId, updateData);
        this.logger.debug({ id: user.id }, "User updated");

        await this.cacheUser(user);
        return user;
    }

    /**
     * Change a user's password
     *
     * Users can change their own password by providing their current password.
     * Admins can change any user's password without providing the current password.
     *
     * @param id - User ID whose password is being changed (string from route params, converted internally)
     * @param currentPassword - Current password (required for non-admin users)
     * @param newPassword - New password to set
     * @param requestingUser - User entity making the request
     * @throws NotFoundError if user doesn't exist
     * @throws ForbiddenError if user doesn't have access
     * @throws BadRequestError if current password is incorrect or new password is invalid
     * @throws UnAuthenticatedError if current password verification fails (for non-admin users)
     */
    async changePassword(
        id: string | number,
        currentPassword: string,
        newPassword: string,
        requestingUser: User
    ): Promise<void> {
        const numericId = typeof id === "string" ? Number(id) : id;

        // Check access - users can change their own password, admins can change any
        this.ensureUserAccess(numericId, requestingUser);

        // Get the target user
        const targetUser = await usersRepo.getUserById(numericId);
        if (!targetUser) {
            this.logger.debug(
                { id: numericId },
                "User not found, throwing not found error"
            );
            throw new NotFoundError("User not found");
        }

        // Validate new password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new BadRequestError(
                passwordValidation.error ?? "Invalid new password"
            );
        }

        // Verify current password (unless admin is changing another user's password)
        const isAdminChangingOtherUser =
            requestingUser.role === "ADMIN" && requestingUser.id !== numericId;
        if (!isAdminChangingOtherUser) {
            // User is changing their own password - must verify current password
            if (!currentPassword) {
                throw new BadRequestError("Current password is required");
            }

            try {
                await hashService.verifyPassword(
                    currentPassword,
                    targetUser.password_hash
                );
            } catch (error) {
                // Convert UnAuthenticatedError to BadRequestError for better UX
                // The user is already authenticated, so this is a validation error
                if (error instanceof UnAuthenticatedError) {
                    this.logger.debug(
                        { id: numericId, userId: requestingUser.id },
                        "Current password verification failed"
                    );
                    throw new BadRequestError("Current password is incorrect");
                }
                throw error;
            }
        } else {
            // Admin is changing another user's password - current password not required
            this.logger.debug(
                { id: numericId, adminId: requestingUser.id },
                "Admin changing another user's password"
            );
        }

        // Prevent setting the same password
        try {
            await hashService.verifyPassword(
                newPassword,
                targetUser.password_hash
            );
            // If verification succeeds, the new password is the same as the current one
            throw new BadRequestError(
                "New password must be different from current password"
            );
        } catch (error) {
            // If verification fails, that's good - passwords are different
            // But if it's a BadRequestError we just threw, rethrow it
            if (error instanceof BadRequestError) {
                throw error;
            }
            // Otherwise, it's an UnAuthenticatedError which means passwords are different - continue
        }

        // Hash the new password
        const hashedPassword = await this.hashPassword(newPassword);

        // Update the user's password
        await usersRepo.updateUser(numericId, {
            password_hash: hashedPassword,
        });

        this.logger.debug(
            {
                id: numericId,
                userId: requestingUser.id,
                isAdmin: isAdminChangingOtherUser,
            },
            "Password changed successfully"
        );

        // Invalidate cache to force fresh fetch on next request
        await this.invalidateCachedUser(numericId);
    }

    /**
     * Delete a user
     *
     * Users can delete their own account. Admins can delete any user's account.
     * Sends a confirmation email after successful deletion.
     *
     * @param id - User ID (string from route params, converted internally)
     * @param requestingUser - User entity making the request
     * @throws NotFoundError if user doesn't exist
     * @throws ForbiddenError if user doesn't have permission to delete this account
     */
    async deleteUser(id: string | number, requestingUser: User): Promise<void> {
        const numericId = typeof id === "string" ? Number(id) : id;

        // Check access - users can delete their own account, admins can delete any account
        this.ensureUserAccess(numericId, requestingUser);

        const existingUser = await usersRepo.getUserById(numericId);
        if (!existingUser) {
            this.logger.debug(
                { id: numericId },
                "User not found, throwing not found error"
            );
            throw new NotFoundError("User not found");
        }

        // Store user email and username before deletion for email notification
        // Email is required in the schema, but we validate it for safety
        if (!existingUser.email) {
            this.logger.error(
                { id: numericId },
                "User email is missing, cannot send deletion confirmation email"
            );
            throw new BadRequestError("User email is required");
        }
        const userEmail: string = existingUser.email;
        // Extract username from email (part before @)
        const emailParts = userEmail.split("@");
        const username: string = emailParts[0] ?? userEmail; // Use email prefix as username, fallback to full email
        const deletionDate = new Date();

        // Delete the user (cascade will handle related data)
        await usersRepo.deleteUser(numericId);
        this.logger.debug(
            { id: numericId, email: userEmail },
            "User deleted successfully"
        );

        // Invalidate cache
        await this.invalidateCachedUser(numericId);

        // Send account deletion confirmation email
        // Note: This is done after deletion, so if email fails, the account is already deleted
        // This is intentional - the account deletion should succeed even if email fails
        try {
            await emailNotificationService.sendAccountDeletedEmail(
                userEmail,
                username,
                deletionDate
            );
            this.logger.debug(
                { email: userEmail },
                "Account deletion confirmation email queued successfully"
            );
        } catch (error) {
            // Log error but don't throw - account is already deleted
            // Email failure should not prevent account deletion from completing
            this.logger.error(
                {
                    email: userEmail,
                    error:
                        error instanceof Error ? error.message : String(error),
                },
                "Failed to queue account deletion confirmation email, but account was deleted"
            );
        }
    }
}

export default new UsersService();
