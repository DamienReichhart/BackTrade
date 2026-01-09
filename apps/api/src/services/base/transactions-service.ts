import { transactionsRepo } from "@backtrade/data";
import type {
    Transaction,
    TransactionWhereInput,
    TransactionCreateInput,
    TransactionOrderBy,
    SearchQuery,
    User,
    TransactionType,
    SessionUpdateInput,
} from "@backtrade/types";
import { transactionsCacheRepo } from "../../libs/cache";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import ForbiddenError from "../../errors/web/forbidden-error";
import sessionsService from "./sessions-service";
import { BaseService } from "./base-service";
import { buildOrderBy, buildPagination, filterByAccess } from "../../utils";
import { PAGINATION_CONSTANTS } from "../../config/trading-constants";

/**
 * Valid transaction types for search operations
 */
const VALID_TRANSACTION_TYPES = [
    "DEPOSIT",
    "WITHDRAWAL",
    "COMMISSION",
    "PNL",
    "SLIPPAGE",
    "SPREAD",
    "ADJUSTMENT",
] as const;

/**
 * Valid sortable fields for transactions
 */
const VALID_SORT_FIELDS = [
    "id",
    "session_id",
    "transaction_type",
    "amount",
    "balance_after",
    "created_at",
    "updated_at",
] as const;

type TransactionSortField = (typeof VALID_SORT_FIELDS)[number];

/**
 * Transactions Service
 *
 * Handles business logic for transaction operations including CRUD, validation, and caching.
 * Transactions are immutable financial records (create and read only).
 */
class TransactionsService extends BaseService {
    constructor() {
        super("transactions-service");
    }

    // ============================================================================
    // VALIDATION METHODS
    // ============================================================================

    /**
     * Validate that transaction_type is provided
     *
     * @param transactionType - Transaction type to validate
     * @throws BadRequestError if transaction_type is missing
     */
    private validateTransactionType(
        transactionType: TransactionType | undefined | null
    ): void {
        if (!transactionType) {
            throw new BadRequestError("transaction_type is required");
        }
    }

    /**
     * Validate that amount is provided
     *
     * @param amount - Amount to validate
     * @throws BadRequestError if amount is missing
     */
    private validateAmount(amount: number | undefined | null): void {
        if (amount === undefined || amount === null) {
            throw new BadRequestError("amount is required");
        }
        // Note: amount can be negative (for withdrawals, commissions, etc.)
        // No validation needed for amount sign
    }

    /**
     * Validate that balance_after is provided and non-negative
     *
     * @param balanceAfter - Balance after transaction to validate
     * @throws BadRequestError if balance_after is missing or negative
     */
    private validateBalanceAfter(
        balanceAfter: number | undefined | null
    ): void {
        if (balanceAfter === undefined || balanceAfter === null) {
            throw new BadRequestError("balance_after is required");
        }
        if (balanceAfter < 0) {
            throw new BadRequestError("balance_after must be non-negative");
        }
    }

    /**
     * Validate all business rules for transaction creation
     *
     * @param transaction - Transaction creation data
     * @throws BadRequestError if validation fails
     */
    private validateTransactionCreation(
        transaction: TransactionCreateInput
    ): void {
        this.validateTransactionType(transaction.transaction_type);
        this.validateAmount(transaction.amount);
        this.validateBalanceAfter(transaction.balance_after);
    }

    // ============================================================================
    // AUTHORIZATION METHODS
    // ============================================================================

    /**
     * Check if user can access a transaction with a session_id
     *
     * @param sessionId - Session ID to check
     * @param user - User entity making the request
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     */
    private async ensureSessionAccess(
        sessionId: number,
        user: User
    ): Promise<void> {
        await sessionsService.getSessionById(sessionId.toString(), user);
    }

    /**
     * Check if user can access a transaction without a session_id
     * Only admins can access transactions without session_id
     *
     * @param user - User entity making the request
     * @param transactionId - Transaction ID for logging
     * @throws NotFoundError if user is not admin
     */
    private ensureAdminAccessForNullSession(
        user: User,
        transactionId: string
    ): void {
        if (user.role !== "ADMIN") {
            this.logger.debug(
                {
                    id: transactionId,
                    userId: user.id,
                    userRole: user.role,
                },
                "Non-admin user attempted to access transaction without session_id"
            );
            throw new NotFoundError("Transaction not found");
        }
    }

    /**
     * Verify user has access to a transaction
     *
     * @param transaction - Transaction entity to check access for
     * @param user - User entity making the request
     * @param transactionId - Transaction ID for logging
     * @throws NotFoundError if transaction doesn't exist or user doesn't have access
     * @throws ForbiddenError if user doesn't own the session and isn't admin
     */
    private async ensureTransactionAccess(
        transaction: Transaction,
        user: User,
        transactionId: string
    ): Promise<void> {
        if (transaction.session_id) {
            await this.ensureSessionAccess(transaction.session_id, user);
        } else {
            this.ensureAdminAccessForNullSession(user, transactionId);
        }
    }

    /**
     * Verify user has access to a transaction without throwing
     *
     * Used for filtering lists of transactions. Returns true if user has access,
     * false otherwise. Logs access denials for security auditing.
     *
     * @param transaction - Transaction entity to check access for
     * @param user - User entity making the request
     * @returns true if user has access, false otherwise
     */
    private async verifyTransactionAccess(
        transaction: Transaction,
        user: User
    ): Promise<boolean> {
        try {
            if (transaction.session_id) {
                // Check session access - this will throw if user doesn't have access
                await this.ensureSessionAccess(transaction.session_id, user);
                return true;
            } else {
                // Transaction without session_id - only admins can access
                if (user.role !== "ADMIN") {
                    this.logger.debug(
                        {
                            transactionId: transaction.id,
                            userId: user.id,
                            userRole: user.role,
                            reason: "non-admin accessing transaction without session_id",
                        },
                        "Transaction access denied: non-admin accessing transaction without session_id"
                    );
                    return false;
                }
                return true;
            }
        } catch (error) {
            // Log the reason for access denial
            const reason =
                error instanceof NotFoundError
                    ? "session not found"
                    : error instanceof ForbiddenError
                      ? "user does not own session"
                      : "unknown error";

            this.logger.debug(
                {
                    transactionId: transaction.id,
                    sessionId: transaction.session_id,
                    userId: user.id,
                    userRole: user.role,
                    reason,
                },
                "Transaction access denied"
            );

            return false;
        }
    }

    // ============================================================================
    // CACHE METHODS
    // ============================================================================

    /**
     * Get transaction from cache with access verification
     *
     * @param numericId - Numeric transaction ID
     * @param user - User entity making the request
     * @returns Cached transaction or null if not found or access denied
     */
    private async getCachedTransactionWithAccess(
        numericId: number,
        user: User
    ): Promise<Transaction | null> {
        const cachedTransaction =
            await transactionsCacheRepo.getCachedTransaction(numericId);
        if (!cachedTransaction) {
            return null;
        }

        this.logger.trace({ id: numericId }, "Transaction found in cache");

        try {
            await this.ensureTransactionAccess(
                cachedTransaction,
                user,
                numericId.toString()
            );
            return cachedTransaction;
        } catch (error) {
            // If NotFoundError, session doesn't exist - invalidate cache and return null
            if (error instanceof NotFoundError) {
                await transactionsCacheRepo.invalidateCachedTransaction(
                    numericId
                );
                return null;
            }
            // If ForbiddenError or any other error, rethrow immediately without invalidating
            // (cache is valid, user just doesn't have access)
            throw error;
        }
    }

    /**
     * Cache a transaction after retrieval
     *
     * @param transaction - Transaction entity to cache
     */
    private async cacheTransaction(transaction: Transaction): Promise<void> {
        await transactionsCacheRepo.cacheTransaction(
            transaction.id,
            transaction
        );
        this.logger.trace({ id: transaction.id }, "Transaction cached");
    }

    // ============================================================================
    // QUERY BUILDING METHODS
    // ============================================================================

    /**
     * Build session filter for transaction queries
     *
     * @param sessionId - Optional session ID to filter by
     * @param user - User entity making the request
     * @returns Where clause for session filtering
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     */
    private async buildSessionFilter(
        sessionId: string | undefined,
        user: User
    ): Promise<TransactionWhereInput> {
        if (sessionId) {
            const numericSessionId = Number(sessionId);
            await this.ensureSessionAccess(numericSessionId, user);
            return { session_id: { equals: numericSessionId } };
        }

        // Get all sessions for the user
        const userSessions = await sessionsService.getAllSessions(
            user.role === "ADMIN" ? undefined : user.id
        );
        const sessionIds = userSessions.map((s) => s.id);

        if (sessionIds.length === 0) {
            // User has no sessions
            if (user.role === "ADMIN") {
                // Admin can see all transactions, including those without session_id
                return {};
            }
            // Regular user has no sessions, return empty filter (will result in empty array)
            return { session_id: { in: [] } };
        }

        // Filter by user's sessions, but also allow transactions without session_id for admins
        if (user.role === "ADMIN") {
            return {
                OR: [
                    { session_id: { in: sessionIds } },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    { session_id: { equals: null as any } },
                ],
            };
        }

        return { session_id: { in: sessionIds } };
    }

    /**
     * Build search conditions for transaction queries
     *
     * @param searchQuery - Search query string
     * @returns Array of search conditions or empty array
     */
    private buildSearchConditions(
        searchQuery: string
    ): TransactionWhereInput[] {
        const searchConditions: TransactionWhereInput[] = [];
        const upperQ = searchQuery.toUpperCase();

        if (
            VALID_TRANSACTION_TYPES.includes(
                upperQ as (typeof VALID_TRANSACTION_TYPES)[number]
            )
        ) {
            searchConditions.push({
                transaction_type: {
                    equals: upperQ as (typeof VALID_TRANSACTION_TYPES)[number],
                },
            });
        }

        return searchConditions;
    }

    /**
     * Combine session filter with search conditions
     *
     * @param sessionFilter - Session filter where clause
     * @param searchConditions - Search conditions array
     * @returns Combined where clause
     */
    private combineFiltersWithSearch(
        sessionFilter: TransactionWhereInput,
        searchConditions: TransactionWhereInput[]
    ): TransactionWhereInput {
        if (searchConditions.length === 0) {
            return sessionFilter;
        }

        const hasSessionFilter = sessionFilter.session_id ?? sessionFilter.OR;

        if (hasSessionFilter) {
            const existingFilter = sessionFilter.session_id
                ? { session_id: sessionFilter.session_id }
                : { OR: sessionFilter.OR };
            return {
                AND: [existingFilter, { OR: searchConditions }],
            };
        }

        return { OR: searchConditions };
    }

    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

    /**
     * Get a transaction by ID with caching
     *
     * @param id - Transaction ID
     * @param user - User entity making the request (for authorization)
     * @returns Transaction entity
     * @throws NotFoundError if transaction doesn't exist
     * @throws ForbiddenError if user doesn't own the session and isn't admin
     */
    async getTransactionById(id: string, user: User): Promise<Transaction> {
        const numericId = Number(id);

        // Try to get from cache first
        const cachedTransaction = await this.getCachedTransactionWithAccess(
            numericId,
            user
        );
        if (cachedTransaction) {
            return cachedTransaction;
        }

        // Fetch from database
        this.logger.trace(
            { id },
            "Transaction not found in cache, fetching from database"
        );
        const transaction = await transactionsRepo.getTransactionById(id);
        if (!transaction) {
            this.logger.debug(
                { id },
                "Transaction not found, throwing not found error"
            );
            throw new NotFoundError("Transaction not found");
        }

        // Verify access
        await this.ensureTransactionAccess(transaction, user, id);

        // Cache and return
        await this.cacheTransaction(transaction);
        return transaction;
    }

    /**
     * Get all transactions with optional filtering, pagination, and sorting
     *
     * @param sessionId - Optional session ID to filter transactions by
     * @param user - User entity making the request (for authorization)
     * @param query - Optional search query with pagination and sorting
     * @returns Array of transaction entities
     * @throws ForbiddenError if user doesn't own the session and isn't admin
     */
    async getAllTransactions(
        sessionId: string | undefined,
        user: User,
        query?: SearchQuery
    ): Promise<Transaction[]> {
        const {
            q,
            page = PAGINATION_CONSTANTS.DEFAULT_PAGE,
            limit = PAGINATION_CONSTANTS.DEFAULT_PAGE_LIMIT,
            sort,
            order = "desc",
        } = query ?? {};

        // Build session filter
        const sessionFilter = await this.buildSessionFilter(sessionId, user);

        // Handle empty filter case (user has no sessions and is not admin)
        if (sessionFilter.session_id && "in" in sessionFilter.session_id) {
            const sessionIds = sessionFilter.session_id.in;
            if (sessionIds?.length === 0) {
                return [];
            }
        }

        // Build search conditions
        const searchConditions = q ? this.buildSearchConditions(q) : [];

        // Combine filters
        const where = this.combineFiltersWithSearch(
            sessionFilter,
            searchConditions
        );

        // Build order by using shared utility
        const orderBy = buildOrderBy<TransactionSortField>(
            sort,
            order,
            VALID_SORT_FIELDS
        ) as TransactionOrderBy | undefined;

        // Build pagination using shared utility
        const { skip, take } = buildPagination(page, limit);

        // Execute query
        const transactions = await transactionsRepo.getAllTransactions({
            where,
            skip,
            take,
            orderBy,
        });

        // Filter by access using shared utility
        const result = await filterByAccess(
            transactions,
            (transaction) => this.verifyTransactionAccess(transaction, user),
            this.logger,
            { userId: user.id, userRole: user.role, entityType: "Transaction" }
        );

        return result.accessible;
    }

    /**
     * Create a new transaction
     *
     * Validates that the session exists and user owns it (if session_id is provided) before creating the transaction.
     * Business logic validations are handled by validateTransactionCreation.
     *
     * @param transaction - Transaction creation data
     * @param user - User entity making the request (for authorization)
     * @returns Created transaction entity
     * @throws NotFoundError if session doesn't exist (when session_id is provided)
     * @throws ForbiddenError if user doesn't own session and isn't admin (when session_id is provided)
     * @throws BadRequestError if validation fails
     */
    async createTransaction(
        transaction: TransactionCreateInput,
        user: User
    ): Promise<Transaction> {
        // Validate business rules
        this.validateTransactionCreation(transaction);

        // Validate that session exists and user has access (if session_id is provided)
        if (
            transaction.session_id !== undefined &&
            transaction.session_id !== null
        ) {
            await this.ensureSessionAccess(transaction.session_id, user);
        }

        this.logger.trace(
            {
                session_id: transaction.session_id,
                transaction_type: transaction.transaction_type,
                user_id: user.id,
            },
            "Creating transaction"
        );

        const created = await transactionsRepo.createTransaction(transaction);
        this.logger.debug({ id: created.id }, "Transaction created");

        // Update session's current_balance when a transaction is created
        // Use sessionsService to ensure proper cache invalidation
        if (created.session_id !== undefined && created.session_id !== null) {
            const sessionUpdate: SessionUpdateInput = {
                current_balance: created.balance_after,
            };
            await sessionsService.updateSession(
                created.session_id.toString(),
                sessionUpdate,
                user
            );
            this.logger.debug(
                {
                    session_id: created.session_id,
                    new_balance: created.balance_after,
                },
                "Session current_balance updated"
            );
        }

        await this.cacheTransaction(created);
        return created;
    }
}

export default new TransactionsService();
