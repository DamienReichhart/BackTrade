import datasetsService from "../services/base/datasets-service";
import type { Request, Response } from "express";
import BadRequestError from "../errors/web/bad-request-error";

async function getAllDatasets(req: Request, res: Response) {
    const datasets = await datasetsService.getAllDatasets();
    return res.status(200).json(datasets);
}

async function getDatasetById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
        throw new BadRequestError("Dataset ID is required");
    }
    const dataset = await datasetsService.getDatasetById(id);
    return res.status(200).json(dataset);
}

async function createDataset(req: Request, res: Response) {
    const dataset = await datasetsService.createDataset(req.body);
    return res.status(201).json(dataset);
}

async function updateDataset(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
        throw new BadRequestError("Dataset ID is required");
    }
    const dataset = await datasetsService.updateDataset(id, req.body);
    return res.status(200).json(dataset);
}

async function deleteDataset(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
        throw new BadRequestError("Dataset ID is required");
    }
    await datasetsService.deleteDataset(id);
    return res.status(204).send();
}

export default {
    getAllDatasets,
    getDatasetById,
    createDataset,
    updateDataset,
    deleteDataset,
};
