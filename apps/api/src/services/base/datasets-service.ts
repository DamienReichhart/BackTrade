import type { Dataset, Prisma } from "../../generated/prisma/client";
import datasetsRepository from "../../repositories/datasets-repository";
import datasetsCacheService from "../cache/datasets-cache-service";
import { logger } from "../../libs/logger/pino";
import NotFoundError from "../../errors/web/not-found-error";
import type { SearchQuery } from "@backtrade/types";

const datasetServiceLogger = logger.child({
    service: "dataset-service",
});

const getDatasetById = async (id: string): Promise<Dataset> => {
    const numericId = Number(id);
    const cachedDataset =
        await datasetsCacheService.getCachedDataset(numericId);
    if (cachedDataset) {
        datasetServiceLogger.trace({ id }, "Dataset found in cache");
        return cachedDataset;
    }
    datasetServiceLogger.trace(
        { id },
        "Dataset not found in cache, fetching from database"
    );
    const dataset = await datasetsRepository.getDatasetById(id);
    if (!dataset) {
        datasetServiceLogger.debug(
            { id },
            "Dataset not found, throwing not found error"
        );
        throw new NotFoundError("Dataset not found");
    }
    await datasetsCacheService.cacheDataset(numericId, dataset);
    datasetServiceLogger.trace({ id }, "Dataset cached");
    return dataset;
};

const getAllDatasets = async (query?: SearchQuery): Promise<Dataset[]> => {
    const { q, page = 1, limit = 20, sort, order = "desc" } = query ?? {};

    const where: Prisma.DatasetWhereInput | undefined = q
        ? {
              OR: [{ file_name: { contains: q, mode: "insensitive" } }],
          }
        : undefined;

    const orderBy: Prisma.DatasetOrderByWithRelationInput | undefined = sort
        ? { [sort]: order }
        : undefined;

    return datasetsRepository.getAllDatasets({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
    });
};

const createDataset = async (
    dataset: Prisma.DatasetCreateInput
): Promise<Dataset> => {
    const created = await datasetsRepository.createDataset(dataset);
    datasetServiceLogger.debug({ id: created.id }, "Dataset created");
    await datasetsCacheService.cacheDataset(created.id, created);
    datasetServiceLogger.trace({ id: created.id }, "Dataset cached");
    return created;
};

const updateDataset = async (
    id: string,
    dataset: Prisma.DatasetUpdateInput
): Promise<Dataset> => {
    const existing = await datasetsRepository.getDatasetById(id);
    if (!existing) {
        datasetServiceLogger.debug(
            { id },
            "Dataset not found, throwing not found error"
        );
        throw new NotFoundError("Dataset not found");
    }
    const updated = await datasetsRepository.updateDataset(id, dataset);
    datasetServiceLogger.debug({ id: updated.id }, "Dataset updated");
    await datasetsCacheService.cacheDataset(updated.id, updated);
    datasetServiceLogger.trace({ id: updated.id }, "Dataset cached");
    return updated;
};

const deleteDataset = async (id: string): Promise<void> => {
    const existing = await datasetsRepository.getDatasetById(id);
    if (!existing) {
        datasetServiceLogger.debug(
            { id },
            "Dataset not found, throwing not found error"
        );
        throw new NotFoundError("Dataset not found");
    }
    await datasetsRepository.deleteDataset(id);
    datasetServiceLogger.debug({ id }, "Dataset deleted");
    const numericId = Number(id);
    await datasetsCacheService.invalidateCachedDataset(numericId);
    datasetServiceLogger.trace({ id }, "Dataset invalidated from cache");
};

export default {
    getDatasetById,
    getAllDatasets,
    createDataset,
    updateDataset,
    deleteDataset,
};
