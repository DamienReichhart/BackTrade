/**
 * Dataset File Split Processor
 *
 * Processes uploaded dataset files by splitting them into smaller parts
 * for parallel processing. Each part is uploaded to MinIO and a
 * separate processing job is created for it.
 */

import { logger } from "../libs/pino";
import { storageService } from "../libs/storage";
import { datasetsRepo } from "@backtrade/data";
import {
    DatasetFileSplitPayloadSchema,
    DatasetPartProcessPayloadSchema,
    QueueName,
    type DatasetFileSplitPayload,
    type DatasetPartProcessPayload,
} from "@backtrade/types";
import queueService from "../services/queue-service";

/**
 * Maximum number of lines per part file
 */
const MAX_LINES_PER_PART = 10000;

/**
 * Common CSV header patterns (case-insensitive)
 */
const HEADER_PATTERNS = [
    /^timestamp\s*,\s*open\s*,\s*high\s*,\s*low\s*,\s*close\s*,\s*volume$/i,
    /^timestamp,open,high,low,close,volume$/i,
];

/**
 * Dataset File Split Processor
 *
 * Handles splitting large dataset files into smaller chunks for parallel processing.
 */
class DatasetFileSplitProcessor {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "dataset-file-split-processor",
        });
    }

    /**
     * Detect if a line is a CSV header row
     *
     * Checks for common header patterns and non-numeric values in expected numeric columns.
     *
     * @param line - CSV line to check
     * @returns true if the line appears to be a header
     */
    private isHeaderLine(line: string): boolean {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
            return false;
        }

        // Check against known header patterns
        for (const pattern of HEADER_PATTERNS) {
            if (pattern.test(trimmedLine)) {
                return true;
            }
        }

        // Check if line has 6 comma-separated values
        const parts = trimmedLine.split(",");
        if (parts.length !== 6) {
            return false;
        }

        // Check if numeric columns (indices 1-5: open, high, low, close, volume) contain non-numeric values
        // Index 0 is the timestamp which should be numeric, but we also check indices 1-5
        const numericColumns = parts.slice(1);
        const hasNonNumericValues = numericColumns.some((col) => {
            const trimmed = col.trim();
            // Check if it's not a valid number (including negative numbers and decimals)
            return (
                trimmed !== "" &&
                !/^-?\d+\.?\d*$/.test(trimmed) &&
                !/^-?\.\d+$/.test(trimmed)
            );
        });

        return hasNonNumericValues;
    }

    /**
     * Process a dataset file split job
     *
     * Downloads the file from MinIO, splits it into parts,
     * uploads each part, and creates processing jobs for each.
     *
     * @param data - Job payload (validated against DatasetFileSplitPayloadSchema)
     * @throws Error if processing fails
     */
    async process(data: unknown): Promise<void> {
        // Validate payload
        const parseResult = DatasetFileSplitPayloadSchema.safeParse(data);
        if (!parseResult.success) {
            this.logger.error(
                { error: parseResult.error, data },
                "Invalid payload for dataset file split job"
            );
            throw new Error(`Invalid payload: ${parseResult.error.message}`);
        }

        const payload: DatasetFileSplitPayload = parseResult.data;
        const { datasetId, filePath, instrumentId, timeframe } = payload;

        this.logger.info(
            { datasetId, filePath },
            "Starting dataset file split processing"
        );

        // Parse bucket and path from filePath (format: "bucket/path/to/file.csv")
        const [bucket, ...pathParts] = filePath.split("/");
        const objectPath = pathParts.join("/");

        if (!bucket || !objectPath) {
            throw new Error(`Invalid file path format: ${filePath}`);
        }

        // Download file from MinIO
        this.logger.debug(
            { bucket, objectPath },
            "Downloading file from MinIO"
        );
        const fileBuffer = await storageService.download(bucket, objectPath);
        const fileContent = fileBuffer.toString("utf-8");

        // Split content into lines (handle both \n and \r\n line endings)
        const allLines = fileContent
            .split(/\r?\n/)
            .filter((line) => line.trim() !== "");

        if (allLines.length === 0) {
            this.logger.warn({ datasetId }, "Empty file, nothing to process");
            return;
        }

        // Detect and remove header row if present
        let dataLines: string[];
        let hasHeader = false;

        if (this.isHeaderLine(allLines[0]!)) {
            hasHeader = true;
            dataLines = allLines.slice(1);
            this.logger.info(
                { datasetId, headerLine: allLines[0] },
                "Detected and removing CSV header row"
            );
        } else {
            dataLines = allLines;
        }

        const totalLines = dataLines.length;

        this.logger.info(
            { datasetId, totalLines, hasHeader },
            "File downloaded and parsed"
        );

        if (totalLines === 0) {
            this.logger.warn(
                { datasetId },
                "No data lines found after header removal"
            );
            return;
        }

        // Calculate number of parts
        const totalParts = Math.ceil(totalLines / MAX_LINES_PER_PART);

        this.logger.info(
            {
                datasetId,
                totalLines,
                totalParts,
                maxLinesPerPart: MAX_LINES_PER_PART,
            },
            "Splitting file into parts"
        );

        // Split and upload parts
        const partPaths: string[] = [];

        for (let partNumber = 0; partNumber < totalParts; partNumber++) {
            const startLine = partNumber * MAX_LINES_PER_PART;
            const endLine = Math.min(
                startLine + MAX_LINES_PER_PART,
                totalLines
            );
            const partLines = dataLines.slice(startLine, endLine);

            // Create part content
            const partContent = partLines.join("\n");
            const partBuffer = Buffer.from(partContent, "utf-8");

            // Build part path: datasets/{datasetId}/parts/part_{n}.csv
            const partPath = `${datasetId}/parts/part_${partNumber}.csv`;

            this.logger.debug(
                {
                    datasetId,
                    partNumber,
                    startLine,
                    endLine,
                    lineCount: partLines.length,
                },
                "Uploading part to MinIO"
            );

            // Upload part to MinIO
            await storageService.upload(bucket, partPath, partBuffer, {
                contentType: "text/csv",
                metadata: {
                    datasetId: String(datasetId),
                    partNumber: String(partNumber),
                    totalParts: String(totalParts),
                    lineCount: String(partLines.length),
                },
            });

            partPaths.push(`${bucket}/${partPath}`);
        }

        this.logger.info(
            { datasetId, partCount: partPaths.length },
            "All parts uploaded, creating processing jobs"
        );

        // Create processing jobs for each part
        for (let partNumber = 0; partNumber < partPaths.length; partNumber++) {
            const partPayload: DatasetPartProcessPayload = {
                datasetId,
                partPath: partPaths[partNumber]!,
                partNumber,
                totalParts,
                instrumentId,
                timeframe,
            };

            // Validate the payload before queuing
            const partParseResult =
                DatasetPartProcessPayloadSchema.safeParse(partPayload);
            if (!partParseResult.success) {
                this.logger.error(
                    { error: partParseResult.error, partPayload },
                    "Invalid part processing payload"
                );
                throw new Error(
                    `Invalid part payload: ${partParseResult.error.message}`
                );
            }

            await queueService.queueMessage(
                QueueName.datasetPartProcess,
                partPayload
            );

            this.logger.debug(
                { datasetId, partNumber },
                "Part processing job queued"
            );
        }

        // Update dataset with total records count
        await datasetsRepo.updateDataset(datasetId, {
            records_count: totalLines,
        });

        this.logger.info(
            { datasetId, totalLines, totalParts },
            "Dataset file split processing completed"
        );
    }
}

export default new DatasetFileSplitProcessor();
