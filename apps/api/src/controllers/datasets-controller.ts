/**
 * Datasets Controller
 *
 * Handles dataset-related HTTP requests.
 * Orchestrates dataset service operations.
 *
 * Note: Methods that require authentication assume req.user is set by authMiddleware.
 * Routes using those methods must be protected by authMiddleware.
 */

import datasetsService from "../services/base/datasets-service";
import type { Request, Response } from "express";
import {
    SearchQuerySchema,
    type DatasetCreateInput,
    type DatasetUpdateInput,
    type SearchQuery,
    IdParamsSchema,
} from "@backtrade/types";
import BadRequestError from "../errors/web/bad-request-error";
import { logger } from "../libs/pino";

/**
 * Datasets Controller
 *
 * Handles dataset-related HTTP requests.
 * Orchestrates dataset service operations.
 *
 * Authorization model:
 * - Read operations (getById, getAll): Public (any authenticated user)
 * - Write operations (create, update, delete, upload): Admin only
 */
class DatasetsController {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "datasets-controller",
        });
    }

    /**
     * Get all datasets with optional search and pagination
     *
     * Public operation - any authenticated user can list datasets.
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if query parameters are invalid
     */
    async getAllDatasets(req: Request, res: Response): Promise<void> {
        let query: SearchQuery | undefined;
        try {
            query = SearchQuerySchema.parse(req.query);
        } catch {
            throw new BadRequestError("Invalid query parameters");
        }
        const datasets = await datasetsService.getAllDatasets(query);
        res.status(200).json(datasets);
    }

    /**
     * Get dataset by ID
     *
     * Public operation - any authenticated user can read datasets.
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if dataset ID is missing
     */
    async getDatasetById(req: Request, res: Response): Promise<void> {
        const { id } = IdParamsSchema.parse(req.params);
        const dataset = await datasetsService.getDatasetById(id);
        res.status(200).json(dataset);
    }

    /**
     * Create a new dataset
     *
     * Admin-only operation.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws ForbiddenError if user is not admin
     */
    async createDataset(req: Request, res: Response): Promise<void> {
        const user = req.user!;

        this.logger.trace(
            {
                userId: user.id,
                instrumentId: (req.body as DatasetCreateInput).instrument_id,
            },
            "Creating dataset"
        );

        const dataset = await datasetsService.createDataset(
            req.body as DatasetCreateInput,
            user
        );

        this.logger.info(
            { userId: user.id, datasetId: dataset.id },
            "Dataset created successfully"
        );

        res.status(201).json(dataset);
    }

    /**
     * Update an existing dataset
     *
     * Admin-only operation.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if dataset ID is missing
     * @throws ForbiddenError if user is not admin
     */
    async updateDataset(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = IdParamsSchema.parse(req.params);

        this.logger.trace(
            { userId: user.id, datasetId: id },
            "Updating dataset"
        );

        const dataset = await datasetsService.updateDataset(
            id,
            req.body as DatasetUpdateInput,
            user
        );

        this.logger.info(
            { userId: user.id, datasetId: dataset.id },
            "Dataset updated successfully"
        );

        res.status(200).json(dataset);
    }

    /**
     * Delete a dataset
     *
     * Admin-only operation.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if dataset ID is missing
     * @throws ForbiddenError if user is not admin
     */
    async deleteDataset(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = IdParamsSchema.parse(req.params);

        this.logger.trace(
            { userId: user.id, datasetId: id },
            "Deleting dataset"
        );

        await datasetsService.deleteDataset(id, user);

        this.logger.info(
            { userId: user.id, datasetId: id },
            "Dataset deleted successfully"
        );

        res.status(204).send();
    }

    /**
     * Upload a file for a dataset
     *
     * Admin-only operation.
     *
     * @param req - Express request object with file from multer (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if dataset ID or file is missing
     * @throws ForbiddenError if user is not admin
     */
    async uploadFile(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = IdParamsSchema.parse(req.params);

        const file = req.file;
        if (!file) {
            throw new BadRequestError("File is required");
        }

        this.logger.info(
            {
                datasetId: id,
                fileName: file.originalname,
                fileSize: file.size,
                userId: user.id,
            },
            "Processing dataset file upload"
        );

        await datasetsService.uploadDatasetFile(
            id,
            file.buffer,
            file.originalname,
            user
        );

        this.logger.info(
            { userId: user.id, datasetId: id },
            "Dataset file uploaded successfully"
        );

        res.status(204).send();
    }
}

export default new DatasetsController();
