/**
 * Instruments Controller
 *
 * Handles instrument-related HTTP requests.
 * Orchestrates instrument service operations.
 */

import {
    SearchQuerySchema,
    type SearchQuery,
    type InstrumentCreateInput,
    type InstrumentUpdateInput,
} from "@backtrade/types";
import type { Request, Response } from "express";
import instrumentService from "../services/base/instruments-service";
import BadRequestError from "../errors/web/bad-request-error";
import UnAuthenticatedError from "../errors/web/unauthenticated-error";
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
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Instrument ID is required");
        }
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
     * @param req - Express request object (must have req.user set by authMiddleware)
     * @param res - Express response object
     * @throws UnAuthenticatedError if user is not authenticated
     * @throws ForbiddenError if user is not admin
     */
    async createInstrument(req: Request, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnAuthenticatedError(
                "You must be authenticated to create an instrument"
            );
        }

        this.logger.trace(
            {
                userId: req.user.id,
                symbol: (req.body as InstrumentCreateInput).symbol,
            },
            "Creating instrument"
        );

        const instrument = await instrumentService.createInstrument(
            req.body as InstrumentCreateInput,
            req.user
        );

        this.logger.info(
            { userId: req.user.id, instrumentId: instrument.id },
            "Instrument created successfully"
        );

        res.status(201).json(instrument);
    }

    /**
     * Update an existing instrument
     *
     * Admin-only operation.
     *
     * @param req - Express request object (must have req.user set by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if instrument ID is missing
     * @throws UnAuthenticatedError if user is not authenticated
     * @throws ForbiddenError if user is not admin
     */
    async updateInstrument(req: Request, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnAuthenticatedError(
                "You must be authenticated to update an instrument"
            );
        }

        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Instrument ID is required");
        }

        this.logger.trace(
            { userId: req.user.id, instrumentId: id },
            "Updating instrument"
        );

        const instrument = await instrumentService.updateInstrument(
            id,
            req.body as InstrumentUpdateInput,
            req.user
        );

        this.logger.info(
            { userId: req.user.id, instrumentId: instrument.id },
            "Instrument updated successfully"
        );

        res.status(200).json(instrument);
    }

    /**
     * Delete an instrument
     *
     * Admin-only operation.
     *
     * @param req - Express request object (must have req.user set by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if instrument ID is missing
     * @throws UnAuthenticatedError if user is not authenticated
     * @throws ForbiddenError if user is not admin
     */
    async deleteInstrument(req: Request, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnAuthenticatedError(
                "You must be authenticated to delete an instrument"
            );
        }

        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Instrument ID is required");
        }

        this.logger.trace(
            { userId: req.user.id, instrumentId: id },
            "Deleting instrument"
        );

        await instrumentService.deleteInstrument(id, req.user);

        this.logger.info(
            { userId: req.user.id, instrumentId: id },
            "Instrument deleted successfully"
        );

        res.status(204).send();
    }
}

export default new InstrumentsController();
