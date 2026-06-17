/**
 * Dataset File Split Processor
 *
 * Processes uploaded dataset files by splitting them into smaller parts
 * for parallel processing. Uses streaming to handle files of any size
 * without loading them entirely into memory.
 *
 * Each part is uploaded to storage and a processing job is queued immediately,
 * enabling progressive parallel processing of large files.
 */

import { createInterface, type Interface as ReadlineInterface } from "readline";
import { logger } from "../libs/pino";
import { storageService } from "../libs/storage";
import { datasetsRepo } from "@backtrade/data";
import {
    DatasetFileSplitPayloadSchema,
    DatasetPartProcessPayloadSchema,
    QueueName,
    type DatasetFileSplitPayload,
    type DatasetPartProcessPayload,
    type Timeframe,
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
 * State tracking for streaming file processing
 */
interface StreamProcessingState {
    /** Current part number (0-indexed) */
    partNumber: number;
    /** Lines accumulated for current part */
    currentPartLines: string[];
    /** Total data lines processed (excluding header) */
    totalDataLines: number;
    /** Whether the first line was detected as a header */
    hasHeader: boolean;
    /** Whether we've processed the first line */
    firstLineProcessed: boolean;
    /** Bucket name for storage */
    bucket: string;
    /** Dataset ID */
    datasetId: number;
    /** Instrument ID for candle processing */
    instrumentId: number;
    /** Timeframe for candle processing */
    timeframe: Timeframe;
}

/**
 * Dataset File Split Processor
 *
 * Handles splitting large dataset files into smaller chunks for parallel processing.
 * Uses streaming to support files of any size without memory constraints.
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
     * Upload a part to storage and queue its processing job
     *
     * @param state - Current processing state
     * @param totalParts - Total number of parts (may be estimated during streaming)
     * @returns The full path to the uploaded part
     */
    private async uploadPartAndQueueJob(
        state: StreamProcessingState,
        totalParts: number
    ): Promise<string> {
        const {
            bucket,
            datasetId,
            partNumber,
            currentPartLines,
            instrumentId,
            timeframe,
        } = state;
        const partPath = `${datasetId}/parts/part_${partNumber}.csv`;
        const fullPartPath = `${bucket}/${partPath}`;

        // Create part content and upload
        const partContent = currentPartLines.join("\n");
        const partBuffer = Buffer.from(partContent, "utf-8");

        this.logger.debug(
            {
                datasetId,
                partNumber,
                lineCount: currentPartLines.length,
            },
            "Uploading part to storage"
        );

        await storageService.upload(bucket, partPath, partBuffer, {
            contentType: "text/csv",
            metadata: {
                datasetId: String(datasetId),
                partNumber: String(partNumber),
                totalParts: String(totalParts),
                lineCount: String(currentPartLines.length),
            },
        });

        // Queue processing job immediately
        const partPayload: DatasetPartProcessPayload = {
            datasetId,
            partPath: fullPartPath,
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
            { datasetId, partNumber, lineCount: currentPartLines.length },
            "Part uploaded and processing job queued"
        );

        return fullPartPath;
    }

    /**
     * Process a single line from the stream
     *
     * @param line - The line to process
     * @param state - Current processing state (mutated)
     * @returns Promise that resolves when line is processed
     */
    private async processLine(
        line: string,
        state: StreamProcessingState
    ): Promise<void> {
        const trimmedLine = line.trim();

        // Skip empty lines
        if (!trimmedLine) {
            return;
        }

        // Handle first line - check for header
        if (!state.firstLineProcessed) {
            state.firstLineProcessed = true;

            if (this.isHeaderLine(trimmedLine)) {
                state.hasHeader = true;
                this.logger.info(
                    { datasetId: state.datasetId, headerLine: trimmedLine },
                    "Detected and skipping CSV header row"
                );
                return; // Skip header line
            }
        }

        // Add line to current part buffer
        state.currentPartLines.push(trimmedLine);
        state.totalDataLines++;

        // Check if current part is full
        if (state.currentPartLines.length >= MAX_LINES_PER_PART) {
            // Estimate total parts based on current progress
            // This estimate improves as we process more of the file
            const estimatedTotalParts = state.partNumber + 1;

            await this.uploadPartAndQueueJob(state, estimatedTotalParts);

            // Reset for next part
            state.currentPartLines = [];
            state.partNumber++;
        }
    }

    /**
     * Process a dataset file split job using streaming
     *
     * Streams the file from storage, splits it into parts progressively,
     * uploads each part, and immediately queues processing jobs.
     * This approach handles files of any size without memory constraints.
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

        // Get file stream from storage
        this.logger.debug(
            { bucket, objectPath },
            "Creating file stream from storage"
        );
        const fileStream = await storageService.getObjectStream(
            bucket,
            objectPath
        );

        // Initialize processing state
        const state: StreamProcessingState = {
            partNumber: 0,
            currentPartLines: [],
            totalDataLines: 0,
            hasHeader: false,
            firstLineProcessed: false,
            bucket,
            datasetId,
            instrumentId,
            timeframe,
        };

        // Create readline interface for line-by-line processing
        const rl: ReadlineInterface = createInterface({
            input: fileStream,
            crlfDelay: Infinity, // Handle both \n and \r\n line endings
        });

        // Process file line by line
        try {
            for await (const line of rl) {
                await this.processLine(line, state);
            }
        } catch (error) {
            // Clean up readline interface on error
            rl.close();
            fileStream.destroy();
            throw error;
        }

        // Handle final part (if there are remaining lines)
        if (state.currentPartLines.length > 0) {
            const totalParts = state.partNumber + 1;
            await this.uploadPartAndQueueJob(state, totalParts);
            state.partNumber++;
        }

        const totalParts = state.partNumber;
        const totalLines = state.totalDataLines;

        // Handle edge cases
        if (totalLines === 0) {
            this.logger.warn(
                { datasetId, hasHeader: state.hasHeader },
                state.hasHeader
                    ? "No data lines found after header removal"
                    : "Empty file, nothing to process"
            );
            return;
        }

        this.logger.info(
            {
                datasetId,
                totalLines,
                totalParts,
                hasHeader: state.hasHeader,
                maxLinesPerPart: MAX_LINES_PER_PART,
            },
            "File streaming and splitting completed"
        );

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
