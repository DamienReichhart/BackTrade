import { instrumentsRepo } from "@backtrade/data";
import type {
    Instrument,
    InstrumentWhereInput,
    InstrumentCreateInput,
    InstrumentUpdateInput,
    InstrumentOrderBy,
    SearchQuery,
    User,
} from "@backtrade/types";
import { instrumentsCacheRepo } from "../../libs/cache";
import { logger } from "../../libs/pino";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import ForbiddenError from "../../errors/web/forbidden-error";

/**
 * Valid sortable fields for instruments
 */
const VALID_SORT_FIELDS = [
    "id",
    "symbol",
    "display_name",
    "pip_size",
    "created_at",
    "updated_at",
] as const;

/**
 * Instruments Service
 *
 * Handles business logic for instrument operations including CRUD, validation, and caching.
 * Instruments are trading assets (e.g., EURUSD, BTCUSD) that sessions can trade.
 *
 * Authorization model:
 * - Read operations (getById, getAll): Public (any authenticated user)
 * - Write operations (create, update, delete): Admin only
 */
class InstrumentsService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "instruments-service",
        });
    }

    // ============================================================================
    // VALIDATION METHODS
    // ============================================================================

    /**
     * Validate that symbol is provided and non-empty
     *
     * @param symbol - Symbol to validate
     * @throws BadRequestError if symbol is missing or empty
     */
    private validateSymbol(symbol: string | undefined | null): void {
        if (!symbol || symbol.trim().length === 0) {
            throw new BadRequestError("symbol is required and cannot be empty");
        }
    }

    /**
     * Validate that display_name is non-empty if provided
     *
     * @param displayName - Display name to validate
     * @throws BadRequestError if display_name is empty string
     */
    private validateDisplayName(displayName: string | undefined | null): void {
        if (displayName !== undefined && displayName !== null) {
            if (displayName.trim().length === 0) {
                throw new BadRequestError(
                    "display_name cannot be empty if provided"
                );
            }
        }
    }

    /**
     * Validate that pip_size is positive if provided
     *
     * @param pipSize - Pip size to validate
     * @throws BadRequestError if pip_size is invalid
     */
    private validatePipSize(pipSize: number | undefined | null): void {
        if (pipSize !== undefined && pipSize !== null && pipSize <= 0) {
            throw new BadRequestError("pip_size must be positive if provided");
        }
    }

    /**
     * Validate all business rules for instrument creation
     *
     * @param instrument - Instrument creation data
     * @throws BadRequestError if validation fails
     */
    private validateInstrumentCreation(
        instrument: InstrumentCreateInput
    ): void {
        this.validateSymbol(instrument.symbol);
        this.validateDisplayName(instrument.display_name);
        this.validatePipSize(instrument.pip_size);
    }

    /**
     * Validate all business rules for instrument update
     *
     * @param instrument - Instrument update data
     * @throws BadRequestError if validation fails
     */
    private validateInstrumentUpdate(instrument: InstrumentUpdateInput): void {
        // Symbol cannot be changed to empty if provided
        if (instrument.symbol !== undefined) {
            this.validateSymbol(instrument.symbol);
        }
        this.validateDisplayName(instrument.display_name);
        this.validatePipSize(instrument.pip_size);
    }

    // ============================================================================
    // AUTHORIZATION METHODS
    // ============================================================================

    /**
     * Ensure user has admin access for write operations
     *
     * Instruments are public for reading but require admin access for modifications.
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
                "Non-admin user attempted instrument write operation"
            );
            throw new ForbiddenError(
                "Only administrators can perform this operation on instruments"
            );
        }
    }

    // ============================================================================
    // CACHE METHODS
    // ============================================================================

    /**
     * Get instrument from cache
     *
     * @param numericId - Numeric instrument ID
     * @returns Cached instrument or null if not found
     */
    private async getCachedInstrument(
        numericId: number
    ): Promise<Instrument | null> {
        const cachedInstrument =
            await instrumentsCacheRepo.getCachedInstrument(numericId);
        if (cachedInstrument) {
            this.logger.trace({ id: numericId }, "Instrument found in cache");
        }
        return cachedInstrument;
    }

    /**
     * Cache an instrument after retrieval
     *
     * @param instrument - Instrument entity to cache
     */
    private async cacheInstrument(instrument: Instrument): Promise<void> {
        await instrumentsCacheRepo.cacheInstrument(instrument.id, instrument);
        this.logger.trace({ id: instrument.id }, "Instrument cached");
    }

    /**
     * Invalidate a cached instrument
     *
     * @param numericId - Numeric instrument ID
     */
    private async invalidateCachedInstrument(numericId: number): Promise<void> {
        await instrumentsCacheRepo.invalidateCachedInstrument(numericId);
        this.logger.trace(
            { id: numericId },
            "Instrument invalidated from cache"
        );
    }

    // ============================================================================
    // QUERY BUILDING METHODS
    // ============================================================================

    /**
     * Build search conditions for instrument queries
     *
     * @param searchQuery - Search query string
     * @returns Where clause with search conditions or undefined
     */
    private buildSearchConditions(
        searchQuery: string
    ): InstrumentWhereInput | undefined {
        if (!searchQuery) {
            return undefined;
        }

        return {
            OR: [
                {
                    symbol: {
                        contains: searchQuery,
                        mode: "insensitive" as const,
                    },
                },
                {
                    display_name: {
                        contains: searchQuery,
                        mode: "insensitive" as const,
                    },
                },
            ],
        };
    }

    /**
     * Build order by clause for instrument queries
     *
     * @param sort - Sort field name
     * @param order - Sort order ("asc" or "desc")
     * @returns Order by clause or undefined
     */
    private buildOrderBy(
        sort: string | undefined,
        order: "asc" | "desc"
    ): InstrumentOrderBy | undefined {
        if (
            !sort ||
            !VALID_SORT_FIELDS.includes(
                sort as (typeof VALID_SORT_FIELDS)[number]
            )
        ) {
            return undefined;
        }

        return { [sort]: order } as InstrumentOrderBy;
    }

    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

    /**
     * Get an instrument by ID with caching
     *
     * Public operation - any authenticated user can read instruments.
     *
     * @param id - Instrument ID
     * @returns Instrument entity
     * @throws NotFoundError if instrument doesn't exist
     */
    async getInstrumentById(id: string): Promise<Instrument> {
        const numericId = Number(id);

        // Try to get from cache first
        const cachedInstrument = await this.getCachedInstrument(numericId);
        if (cachedInstrument) {
            return cachedInstrument;
        }

        // Fetch from database
        this.logger.trace(
            { id },
            "Instrument not found in cache, fetching from database"
        );
        const instrument = await instrumentsRepo.getInstrumentById(id);
        if (!instrument) {
            this.logger.debug(
                { id },
                "Instrument not found, throwing not found error"
            );
            throw new NotFoundError("Instrument not found");
        }

        // Cache and return
        await this.cacheInstrument(instrument);
        return instrument;
    }

    /**
     * Get all instruments with optional search and pagination
     *
     * Public operation - any authenticated user can list instruments.
     *
     * @param query - Optional search query with pagination and sorting
     * @returns Array of instrument entities
     */
    async getAllInstruments(query?: SearchQuery): Promise<Instrument[]> {
        const { q, page = 1, limit = 20, sort, order = "desc" } = query ?? {};

        // Build where clause
        const where = this.buildSearchConditions(q ?? "");

        // Build order by
        const orderBy = this.buildOrderBy(sort, order);

        // Execute query
        return instrumentsRepo.getAllInstruments({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy,
        });
    }

    /**
     * Create a new instrument
     *
     * Admin-only operation.
     *
     * @param instrument - Instrument creation data
     * @param user - User entity making the request (for authorization)
     * @returns Created instrument entity
     * @throws ForbiddenError if user is not admin
     * @throws BadRequestError if validation fails
     */
    async createInstrument(
        instrument: InstrumentCreateInput,
        user: User
    ): Promise<Instrument> {
        // Check admin access
        this.ensureAdminAccess(user, "create");

        // Validate business rules
        this.validateInstrumentCreation(instrument);

        this.logger.trace(
            { symbol: instrument.symbol, userId: user.id },
            "Creating instrument"
        );

        const created = await instrumentsRepo.createInstrument(instrument);
        this.logger.debug({ id: created.id }, "Instrument created");

        await this.cacheInstrument(created);
        return created;
    }

    /**
     * Update an existing instrument
     *
     * Admin-only operation.
     *
     * @param id - Instrument ID
     * @param instrument - Instrument update data
     * @param user - User entity making the request (for authorization)
     * @returns Updated instrument entity
     * @throws NotFoundError if instrument doesn't exist
     * @throws ForbiddenError if user is not admin
     * @throws BadRequestError if validation fails
     */
    async updateInstrument(
        id: string,
        instrument: InstrumentUpdateInput,
        user: User
    ): Promise<Instrument> {
        // Check admin access
        this.ensureAdminAccess(user, "update");

        const existing = await instrumentsRepo.getInstrumentById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Instrument not found, throwing not found error"
            );
            throw new NotFoundError("Instrument not found");
        }

        // Validate business rules
        this.validateInstrumentUpdate(instrument);

        const updated = await instrumentsRepo.updateInstrument(id, instrument);
        this.logger.debug({ id: updated.id }, "Instrument updated");

        await this.cacheInstrument(updated);
        return updated;
    }

    /**
     * Delete an instrument
     *
     * Admin-only operation.
     *
     * @param id - Instrument ID
     * @param user - User entity making the request (for authorization)
     * @throws NotFoundError if instrument doesn't exist
     * @throws ForbiddenError if user is not admin
     */
    async deleteInstrument(id: string, user: User): Promise<void> {
        // Check admin access
        this.ensureAdminAccess(user, "delete");

        const existing = await instrumentsRepo.getInstrumentById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Instrument not found, throwing not found error"
            );
            throw new NotFoundError("Instrument not found");
        }

        await instrumentsRepo.deleteInstrument(id);
        this.logger.debug({ id }, "Instrument deleted");

        await this.invalidateCachedInstrument(Number(id));
    }
}

export default new InstrumentsService();
