import type { Dataset } from "@backtrade/types";

/**
 * Calculated statistics for dataset management
 */
export interface DatasetStats {
    totalRegistered: number;
    withDataUploaded: number;
    awaitingUpload: number;
    totalDataPoints: number;
    uploadCompletionRate: number;
    averageRecordsPerDataset: number;
}

/**
 * Calculates comprehensive statistics from dataset array
 *
 * @param datasets - Array of dataset objects
 * @returns Calculated statistics object
 */
export function calculateDatasetStats(datasets: Dataset[]): DatasetStats {
    const totalRegistered = datasets.length;
    const withDataUploaded = datasets.filter((d) => d.file_name).length;
    const awaitingUpload = totalRegistered - withDataUploaded;
    const totalDataPoints = datasets.reduce(
        (acc, d) => acc + (d.records_count ?? 0),
        0
    );

    const totalDataPointsUploaded = datasets
        .filter((d) => d.file_name)
        .reduce((acc, d) => acc + (d.records_count ?? 0), 0);

    const uploadCompletionRate =
        totalRegistered > 0
            ? Math.round((withDataUploaded / totalRegistered) * 100)
            : 0;

    const averageRecordsPerDataset =
        withDataUploaded > 0
            ? Math.round(totalDataPointsUploaded / withDataUploaded)
            : 0;

    return {
        totalRegistered,
        withDataUploaded,
        awaitingUpload,
        totalDataPoints,
        uploadCompletionRate,
        averageRecordsPerDataset,
    };
}
