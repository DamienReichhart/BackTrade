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
import { logger } from "../libs/pino";

/**
 * Instruments Controller
 *
 * Handles instrument-related HTTP requests.
 * Orchestrates instrument service operations.
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
     * @param req - Express request object
     * @param res - Express response object
     */
    async createInstrument(req: Request, res: Response): Promise<void> {
        const instrument = await instrumentService.createInstrument(
            req.body as InstrumentCreateInput
        );
        res.status(201).json(instrument);
    }

    /**
     * Update an existing instrument
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if instrument ID is missing
     */
    async updateInstrument(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Instrument ID is required");
        }
        const instrument = await instrumentService.updateInstrument(
            id,
            req.body as InstrumentUpdateInput
        );
        res.status(200).json(instrument);
    }

    /**
     * Delete an instrument
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if instrument ID is missing
     */
    async deleteInstrument(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Instrument ID is required");
        }
        await instrumentService.deleteInstrument(id);
        res.status(204).send();
    }
}

export default new InstrumentsController();
