/**
 * Dataset Part Processor
 *
 * Processes individual parts of a split dataset file.
 * Parses CSV lines and inserts candles into ClickHouse.
 */

import { logger } from "../libs/pino";
import { storageService } from "../libs/storage";
import { candlesRepo, datasetsRepo } from "@backtrade/data";
import {
    DatasetPartProcessPayloadSchema,
    type DatasetPartProcessPayload,
    type CandleCreateInput,
} from "@backtrade/types";
import { parseDatasetLines } from "@backtrade/utils";

/**
 * Dataset Part Processor
 *
 * Handles processing of individual dataset file parts.
 * Parses CSV data and bulk inserts candles into the database.
 */
class DatasetPartProcessor {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "dataset-part-processor",
        });
    }

    /**
     * Process a dataset part job
     *
     * Downloads the part from MinIO, parses the CSV lines,
     * and bulk inserts candles into ClickHouse.
     *
     * @param data - Job payload (validated against DatasetPartProcessPayloadSchema)
     * @throws Error if processing fails
     */
    async process(data: unknown): Promise<void> {
        // Validate payload
        const parseResult = DatasetPartProcessPayloadSchema.safeParse(data);
        if (!parseResult.success) {
            this.logger.error(
                { error: parseResult.error, data },
                "Invalid payload for dataset part process job"
            );
            throw new Error(`Invalid payload: ${parseResult.error.message}`);
        }

        const payload: DatasetPartProcessPayload = parseResult.data;
        const {
            datasetId,
            partPath,
            partNumber,
            totalParts,
            instrumentId,
            timeframe,
        } = payload;

        this.logger.info(
            { datasetId, partPath, partNumber, totalParts },
            "Starting dataset part processing"
        );

        // Parse bucket and path from partPath (format: "bucket/path/to/part.csv")
        const [bucket, ...pathParts] = partPath.split("/");
        const objectPath = pathParts.join("/");

        if (!bucket || !objectPath) {
            throw new Error(`Invalid part path format: ${partPath}`);
        }

        // Download part from MinIO
        this.logger.debug(
            { bucket, objectPath },
            "Downloading part from MinIO"
        );
        const partBuffer = await storageService.download(bucket, objectPath);
        const partContent = partBuffer.toString("utf-8");

        // Split content into lines
        const lines = partContent
            .split(/\r?\n/)
            .filter((line) => line.trim() !== "");

        this.logger.info(
            { datasetId, partNumber, lineCount: lines.length },
            "Part downloaded and parsed"
        );

        if (lines.length === 0) {
            this.logger.warn(
                { datasetId, partNumber },
                "Empty part, nothing to process"
            );
            return;
        }

        // Parse all lines
        const { candles: parsedCandles, errors: parseErrors } =
            parseDatasetLines(lines);

        if (parseErrors.length > 0) {
            this.logger.warn(
                {
                    datasetId,
                    partNumber,
                    errorCount: parseErrors.length,
                    firstErrors: parseErrors.slice(0, 5),
                },
                "Some lines failed to parse"
            );
        }

        if (parsedCandles.length === 0) {
            this.logger.error(
                { datasetId, partNumber, errorCount: parseErrors.length },
                "No valid candles parsed from part"
            );
            throw new Error(
                `No valid candles parsed from part ${partNumber}. All ${lines.length} lines failed.`
            );
        }

        this.logger.info(
            {
                datasetId,
                partNumber,
                validCandles: parsedCandles.length,
                failedLines: parseErrors.length,
            },
            "Parsed candles from part"
        );

        // Convert parsed candles to CandleCreateInput format
        const candlesToInsert: CandleCreateInput[] = parsedCandles.map(
            (candle) => ({
                instrument_id: instrumentId,
                timeframe,
                ts: candle.ts,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume,
            })
        );

        // Bulk insert candles into ClickHouse
        this.logger.debug(
            { datasetId, partNumber, count: candlesToInsert.length },
            "Inserting candles into ClickHouse"
        );

        const insertedCount = await candlesRepo.createCandles(candlesToInsert);

        this.logger.info(
            { datasetId, partNumber, insertedCount },
            "Candles inserted into ClickHouse"
        );

        // Update dataset start_time and end_time for this part
        // We need to track the min and max timestamps
        if (parsedCandles.length > 0) {
            await this.updateDatasetTimeRange(datasetId, parsedCandles);
        }

        this.logger.info(
            { datasetId, partNumber, insertedCount, totalParts },
            "Dataset part processing completed"
        );
    }

    /**
     * Update dataset start_time and end_time based on parsed candles
     *
     * Uses atomic updates with min/max to handle concurrent part processing.
     *
     * @param datasetId - Dataset ID
     * @param candles - Array of parsed candles from this part
     */
    private async updateDatasetTimeRange(
        datasetId: number,
        candles: Array<{ ts: string }>
    ): Promise<void> {
        // Find min and max timestamps in this part
        const timestamps = candles.map((c) => new Date(c.ts).getTime());
        const minTs = new Date(Math.min(...timestamps));
        const maxTs = new Date(Math.max(...timestamps));

        this.logger.debug(
            {
                datasetId,
                minTs: minTs.toISOString(),
                maxTs: maxTs.toISOString(),
            },
            "Updating dataset time range"
        );

        // Get current dataset to check existing time range
        const dataset = await datasetsRepo.getDatasetById(datasetId);
        if (!dataset) {
            this.logger.warn(
                { datasetId },
                "Dataset not found when updating time range"
            );
            return;
        }

        // Calculate new time range (keeping the wider range)
        const currentStartTime = dataset.start_time
            ? new Date(dataset.start_time)
            : null;
        const currentEndTime = dataset.end_time
            ? new Date(dataset.end_time)
            : null;

        const newStartTime =
            !currentStartTime || minTs < currentStartTime
                ? minTs
                : currentStartTime;
        const newEndTime =
            !currentEndTime || maxTs > currentEndTime ? maxTs : currentEndTime;

        // Update dataset with new time range (convert to ISO strings)
        await datasetsRepo.updateDataset(datasetId, {
            start_time: newStartTime.toISOString(),
            end_time: newEndTime.toISOString(),
        });

        this.logger.debug(
            {
                datasetId,
                startTime: newStartTime.toISOString(),
                endTime: newEndTime.toISOString(),
            },
            "Dataset time range updated"
        );
    }
}

export default new DatasetPartProcessor();
