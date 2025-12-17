/**
 * Datasets Controller
 *
 * Handles dataset-related HTTP requests.
 * Orchestrates dataset service operations.
 */

import datasetsService from "../services/base/datasets-service";
import type { Request, Response } from "express";
import BadRequestError from "../errors/web/bad-request-error";
import { logger } from "../libs/pino";

/**
 * Datasets Controller
 *
 * Handles dataset-related HTTP requests.
 * Orchestrates dataset service operations.
 */
class DatasetsController {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "datasets-controller",
        });
    }

    /**
     * Get all datasets
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    async getAllDatasets(req: Request, res: Response): Promise<void> {
        const datasets = await datasetsService.getAllDatasets();
        res.status(200).json(datasets);
    }

    /**
     * Get dataset by ID
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if dataset ID is missing
     */
    async getDatasetById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Dataset ID is required");
        }
        const dataset = await datasetsService.getDatasetById(id);
        res.status(200).json(dataset);
    }

    /**
     * Create a new dataset
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    async createDataset(req: Request, res: Response): Promise<void> {
        const dataset = await datasetsService.createDataset(req.body);
        res.status(201).json(dataset);
    }

    /**
     * Update an existing dataset
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if dataset ID is missing
     */
    async updateDataset(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Dataset ID is required");
        }
        const dataset = await datasetsService.updateDataset(id, req.body);
        res.status(200).json(dataset);
    }

    /**
     * Delete a dataset
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if dataset ID is missing
     */
    async deleteDataset(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Dataset ID is required");
        }
        await datasetsService.deleteDataset(id);
        res.status(204).send();
    }
}

export default new DatasetsController();
