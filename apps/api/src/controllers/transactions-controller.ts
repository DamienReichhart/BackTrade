/**
 * Transactions Controller
 *
 * Handles transaction-related HTTP requests.
 * Orchestrates transaction service operations.
 *
 * Note: All methods assume req.user is set by authMiddleware.
 * Routes using these methods must be protected by authMiddleware.
 */

import type { Request, Response } from "express";
import {
    SearchQuerySchema,
    type SearchQuery,
    type CreateTransactionRequest,
    type TransactionCreateInput,
    IdParamsSchema,
    SessionIdParamsSchema,
} from "@backtrade/types";
import transactionsService from "../services/base/transactions-service";
import BadRequestError from "../errors/web/bad-request-error";
import { logger } from "../libs/pino";

/**
 * Transactions Controller
 *
 * Handles transaction-related HTTP requests.
 * Orchestrates transaction service operations.
 */
class TransactionsController {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "transactions-controller",
        });
    }

    /**
     * Get all transactions for the currently authenticated user
     *
     * Supports optional session_id filter, search query with pagination and sorting.
     * Only returns transactions belonging to sessions owned by the authenticated user,
     * or transactions without session_id (admin only).
     *
     * Query parameters:
     * - session_id: Optional session ID to filter transactions by
     * - q: Optional search string (searches in transaction_type)
     * - page: Page number (default: 1)
     * - limit: Items per page (default: 20, max: 100)
     * - sort: Field to sort by (default: created_at)
     * - order: Sort order - "asc" or "desc" (default: "desc")
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if query parameters are invalid
     */
    async getAllTransactions(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const sessionId = req.query.session_id as string | undefined;

        // Parse and validate query parameters
        let query: SearchQuery | undefined;
        try {
            query = SearchQuerySchema.parse(req.query);
        } catch (error) {
            this.logger.debug(
                { query: req.query, error },
                "Invalid query parameters for transactions"
            );
            throw new BadRequestError("Invalid query parameters");
        }

        // Fetch transactions
        const transactions = await transactionsService.getAllTransactions(
            sessionId,
            user,
            query
        );

        this.logger.trace(
            {
                userId: user.id,
                sessionId,
                count: transactions.length,
                query,
            },
            "Transactions retrieved for user"
        );

        res.status(200).json(transactions);
    }

    /**
     * Get all transactions for a specific session
     *
     * Returns transactions belonging to the specified session.
     * Only returns transactions if the user owns the session or is an admin.
     *
     * Query parameters:
     * - q: Optional search string (searches in transaction_type)
     * - page: Page number (default: 1)
     * - limit: Items per page (default: 20, max: 100)
     * - sort: Field to sort by (default: created_at)
     * - order: Sort order - "asc" or "desc" (default: "desc")
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if session ID is missing or query parameters are invalid
     */
    async getTransactionsBySession(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { sessionId } = SessionIdParamsSchema.parse(req.params);

        // Parse and validate query parameters
        let query: SearchQuery | undefined;
        try {
            query = SearchQuerySchema.parse(req.query);
        } catch (error) {
            this.logger.debug(
                { query: req.query, error },
                "Invalid query parameters for transactions"
            );
            throw new BadRequestError("Invalid query parameters");
        }

        // Fetch transactions for the session
        const transactions = await transactionsService.getAllTransactions(
            sessionId,
            user,
            query
        );

        this.logger.trace(
            {
                userId: user.id,
                sessionId,
                count: transactions.length,
                query,
            },
            "Transactions retrieved for session"
        );

        res.status(200).json(transactions);
    }

    /**
     * Create a new transaction
     *
     * Creates a transaction for the authenticated user with the provided data.
     * The session_id is optional. If provided, it must belong to a session owned by the user.
     * Timestamps (created_at, updated_at) are set by the database.
     *
     * Request body must include:
     * - transaction_type: Type of transaction (DEPOSIT, WITHDRAWAL, COMMISSION, PNL, SLIPPAGE, SPREAD, ADJUSTMENT)
     * - amount: Transaction amount (can be positive or negative)
     * - balance_after: Account balance after this transaction (must be non-negative)
     * - session_id: Optional ID of the session this transaction belongs to
     *
     * Note: Transactions are immutable financial records. Once created, they cannot be updated or deleted.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if request body is invalid
     */
    async createTransaction(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const requestData = req.body as CreateTransactionRequest;

        // Transform request data to create input
        // created_at and updated_at are set by database
        const transactionData: TransactionCreateInput = {
            session_id: requestData.session_id,
            transaction_type: requestData.transaction_type,
            amount: requestData.amount,
            balance_after: requestData.balance_after,
        };

        this.logger.trace(
            {
                userId: user.id,
                session_id: requestData.session_id,
                transaction_type: requestData.transaction_type,
            },
            "Creating transaction for user"
        );

        const transaction = await transactionsService.createTransaction(
            transactionData,
            user
        );

        this.logger.info(
            { userId: user.id, transactionId: transaction.id },
            "Transaction created successfully"
        );

        res.status(201).json(transaction);
    }

    /**
     * Get a transaction by ID
     *
     * Returns a single transaction by its ID. Only returns transactions belonging to sessions
     * owned by the authenticated user, or transactions without session_id (admin only),
     * unless the user is an admin.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if transaction ID is missing or invalid
     * @throws NotFoundError if transaction doesn't exist
     * @throws ForbiddenError if user doesn't own the session and isn't admin
     */
    async getTransactionById(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = IdParamsSchema.parse(req.params);

        const transaction = await transactionsService.getTransactionById(
            id,
            user
        );

        this.logger.trace(
            { id, userId: user.id },
            "Transaction retrieved successfully"
        );

        res.status(200).json(transaction);
    }
}

export default new TransactionsController();
