/**
 * Instruments Controller
 *
 * Handles instrument-related HTTP requests.
 * Orchestrates instrument service operations.
 *
 * Note: Methods that require authentication assume req.user is set by authMiddleware.
 * Routes using those methods must be protected by authMiddleware.
 */

import {
    SearchQuerySchema,
    type SearchQuery,
    type InstrumentCreateInput,
    type InstrumentUpdateInput,
    IdParamsSchema,
} from "@backtrade/types";
import type { Request, Response } from "express";
import instrumentService from "../services/base/instruments-service";
import BadRequestError from "../errors/web/bad-request-error";
import { logger } from "../libs/pino";

/**
 * Instruments Controller
 *
 * Handles instrument-related HTTP requests.
 * Orchestrates instrument service operations.
 *
 * Authorization model:
 * - Read operations (getById, getAll): Public (any authenticated user)
 * - Write operations (create, update, delete): Admin only
 */
class InstrumentsController {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "instruments-controller",
        });
    }

    /**
     * Get instrument by ID
     *
     * Public operation - any authenticated user can read instruments.
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if instrument ID is missing
     */
    async getInstrumentById(req: Request, res: Response): Promise<void> {
        const { id } = IdParamsSchema.parse(req.params);
        const instrument = await instrumentService.getInstrumentById(id);
        res.status(200).json(instrument);
    }

    /**
     * Get all instruments with optional search query
     *
     * Public operation - any authenticated user can list instruments.
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if query parameters are invalid
     */
    async getAllInstruments(req: Request, res: Response): Promise<void> {
        let query: SearchQuery | undefined;
        try {
            query = SearchQuerySchema.parse(req.query);
        } catch {
            throw new BadRequestError("Invalid query parameters");
        }
        const instruments = await instrumentService.getAllInstruments(query);
        res.status(200).json(instruments);
    }

    /**
     * Create a new instrument
     *
     * Admin-only operation.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws ForbiddenError if user is not admin
     */
    async createInstrument(req: Request, res: Response): Promise<void> {
        const user = req.user!;

        this.logger.trace(
            {
                userId: user.id,
                symbol: (req.body as InstrumentCreateInput).symbol,
            },
            "Creating instrument"
        );

        const instrument = await instrumentService.createInstrument(
            req.body as InstrumentCreateInput,
            user
        );

        this.logger.info(
            { userId: user.id, instrumentId: instrument.id },
            "Instrument created successfully"
        );

        res.status(201).json(instrument);
    }

    /**
     * Update an existing instrument
     *
     * Admin-only operation.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if instrument ID is missing
     * @throws ForbiddenError if user is not admin
     */
    async updateInstrument(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = IdParamsSchema.parse(req.params);

        this.logger.trace(
            { userId: user.id, instrumentId: id },
            "Updating instrument"
        );

        const instrument = await instrumentService.updateInstrument(
            id,
            req.body as InstrumentUpdateInput,
            user
        );

        this.logger.info(
            { userId: user.id, instrumentId: instrument.id },
            "Instrument updated successfully"
        );

        res.status(200).json(instrument);
    }

    /**
     * Delete an instrument
     *
     * Admin-only operation.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if instrument ID is missing
     * @throws ForbiddenError if user is not admin
     */
    async deleteInstrument(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = IdParamsSchema.parse(req.params);

        this.logger.trace(
            { userId: user.id, instrumentId: id },
            "Deleting instrument"
        );

        await instrumentService.deleteInstrument(id, user);

        this.logger.info(
            { userId: user.id, instrumentId: id },
            "Instrument deleted successfully"
        );

        res.status(204).send();
    }
}

export default new InstrumentsController();
