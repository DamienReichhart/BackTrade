/**
 * Storage Service
 *
 * Handles file storage operations with MinIO.
 * Provides a clean interface for uploading, downloading, deleting, and managing files.
 */

import type { Client, BucketItemStat } from "minio";
import type { Readable } from "stream";
import type { Logger } from "@backtrade/logger";

/**
 * Storage service configuration
 */
export interface StorageServiceConfig {
    /** MinIO client instance */
    client: Client;
    /** Logger instance from the consuming application */
    logger: Logger;
}

/**
 * File upload options
 */
export interface UploadOptions {
    /** Content type of the file (e.g., 'image/png', 'application/json') */
    contentType?: string;
    /** Metadata to attach to the file */
    metadata?: Record<string, string>;
}

/**
 * Storage Service
 *
 * Handles file storage operations with MinIO.
 */
export class StorageService {
    private readonly client: Client;
    private readonly logger: ReturnType<Logger["child"]>;

    constructor(config: StorageServiceConfig) {
        this.client = config.client;
        this.logger = config.logger.child({
            service: "storage-service",
        });
    }

    /**
     * Upload a file to MinIO
     *
     * @param bucketName - Name of the bucket
     * @param fileName - Name/path of the file in the bucket
     * @param file - File content as Buffer
     * @param options - Optional upload options (contentType, metadata)
     * @throws Error if upload fails
     *
     * @example
     * ```ts
     * await storageService.upload(
     *   "my-bucket",
     *   "path/to/file.txt",
     *   Buffer.from("file content")
     * );
     * ```
     */
    async upload(
        bucketName: string,
        fileName: string,
        file: Buffer,
        options?: UploadOptions
    ): Promise<void> {
        try {
            // Ensure bucket exists before uploading
            await this.ensureBucket(bucketName);

            await this.client.putObject(
                bucketName,
                fileName,
                file,
                file.length,
                {
                    "Content-Type": options?.contentType,
                    ...options?.metadata,
                }
            );

            this.logger.info(
                {
                    bucket: bucketName,
                    fileName,
                    size: file.length,
                },
                "File uploaded successfully"
            );
        } catch (error) {
            this.logger.error(
                {
                    error,
                    bucket: bucketName,
                    fileName,
                },
                "Error uploading file"
            );
            throw error;
        }
    }

    /**
     * Download a file from MinIO as a Buffer
     *
     * @param bucketName - Name of the bucket
     * @param fileName - Name/path of the file in the bucket
     * @returns File content as Buffer
     * @throws Error if download fails or file doesn't exist
     *
     * @example
     * ```ts
     * const fileBuffer = await storageService.download("my-bucket", "path/to/file.txt");
     * ```
     */
    async download(bucketName: string, fileName: string): Promise<Buffer> {
        try {
            const stream = await this.client.getObject(bucketName, fileName);
            const buffer = await this.streamToBuffer(stream);

            this.logger.info(
                {
                    bucket: bucketName,
                    fileName,
                    size: buffer.length,
                },
                "File downloaded successfully"
            );

            return buffer;
        } catch (error) {
            this.logger.error(
                {
                    error,
                    bucket: bucketName,
                    fileName,
                },
                "Error downloading file"
            );
            throw error;
        }
    }

    /**
     * Get a file from MinIO as a readable stream
     * Useful for large files to avoid loading entire file into memory
     *
     * @param bucketName - Name of the bucket
     * @param fileName - Name/path of the file in the bucket
     * @returns Readable stream of the file
     * @throws Error if stream creation fails or file doesn't exist
     *
     * @example
     * ```ts
     * const stream = await storageService.getObjectStream("my-bucket", "large-file.zip");
     * stream.pipe(fs.createWriteStream("output.zip"));
     * ```
     */
    async getObjectStream(
        bucketName: string,
        fileName: string
    ): Promise<Readable> {
        try {
            const stream = await this.client.getObject(bucketName, fileName);

            this.logger.debug(
                {
                    bucket: bucketName,
                    fileName,
                },
                "File stream created"
            );

            return stream;
        } catch (error) {
            this.logger.error(
                {
                    error,
                    bucket: bucketName,
                    fileName,
                },
                "Error creating file stream"
            );
            throw error;
        }
    }

    /**
     * Delete a file from MinIO
     *
     * @param bucketName - Name of the bucket
     * @param fileName - Name/path of the file in the bucket
     * @throws Error if deletion fails
     *
     * @example
     * ```ts
     * await storageService.delete("my-bucket", "path/to/file.txt");
     * ```
     */
    async delete(bucketName: string, fileName: string): Promise<void> {
        try {
            await this.client.removeObject(bucketName, fileName);

            this.logger.info(
                {
                    bucket: bucketName,
                    fileName,
                },
                "File deleted successfully"
            );
        } catch (error) {
            this.logger.error(
                {
                    error,
                    bucket: bucketName,
                    fileName,
                },
                "Error deleting file"
            );
            throw error;
        }
    }

    /**
     * Check if a file exists in MinIO
     *
     * @param bucketName - Name of the bucket
     * @param fileName - Name/path of the file in the bucket
     * @returns True if file exists, false otherwise
     *
     * @example
     * ```ts
     * const exists = await storageService.exists("my-bucket", "path/to/file.txt");
     * if (exists) {
     *   // File exists
     * }
     * ```
     */
    async exists(bucketName: string, fileName: string): Promise<boolean> {
        try {
            await this.client.statObject(bucketName, fileName);
            return true;
        } catch (error) {
            // If error is "not found", file doesn't exist
            if (
                error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === "NotFound"
            ) {
                return false;
            }
            // For other errors, log and return false
            this.logger.error(
                {
                    error,
                    bucket: bucketName,
                    fileName,
                },
                "Error checking if file exists"
            );
            return false;
        }
    }

    /**
     * Get file metadata and statistics
     *
     * @param bucketName - Name of the bucket
     * @param fileName - Name/path of the file in the bucket
     * @returns File statistics (size, lastModified, etc.)
     * @throws Error if file doesn't exist or stat fails
     *
     * @example
     * ```ts
     * const stats = await storageService.stat("my-bucket", "path/to/file.txt");
     * console.log(`File size: ${stats.size} bytes`);
     * ```
     */
    async stat(bucketName: string, fileName: string): Promise<BucketItemStat> {
        try {
            const stats = await this.client.statObject(bucketName, fileName);

            this.logger.debug(
                {
                    bucket: bucketName,
                    fileName,
                    size: stats.size,
                },
                "File stats retrieved"
            );

            return stats;
        } catch (error) {
            this.logger.error(
                {
                    error,
                    bucket: bucketName,
                    fileName,
                },
                "Error getting file stats"
            );
            throw error;
        }
    }

    /**
     * Check if a bucket exists
     *
     * @param bucketName - Name of the bucket
     * @returns True if bucket exists, false otherwise
     *
     * @example
     * ```ts
     * const exists = await storageService.bucketExists("my-bucket");
     * ```
     */
    async bucketExists(bucketName: string): Promise<boolean> {
        try {
            const exists = await this.client.bucketExists(bucketName);
            return exists;
        } catch (error) {
            this.logger.error(
                {
                    error,
                    bucket: bucketName,
                },
                "Error checking if bucket exists"
            );
            return false;
        }
    }

    /**
     * Ensure a bucket exists, create it if it doesn't
     *
     * @param bucketName - Name of the bucket
     * @throws Error if bucket creation fails
     *
     * @example
     * ```ts
     * await storageService.ensureBucket("my-bucket");
     * ```
     */
    async ensureBucket(bucketName: string): Promise<void> {
        try {
            const exists = await this.bucketExists(bucketName);
            if (!exists) {
                await this.client.makeBucket(bucketName);
                this.logger.info(
                    {
                        bucket: bucketName,
                    },
                    "Bucket created"
                );
            }
        } catch (error) {
            this.logger.error(
                {
                    error,
                    bucket: bucketName,
                },
                "Error ensuring bucket exists"
            );
            throw error;
        }
    }

    /**
     * Create a bucket (fails if bucket already exists)
     *
     * @param bucketName - Name of the bucket
     * @throws Error if bucket creation fails or bucket already exists
     *
     * @example
     * ```ts
     * await storageService.createBucket("my-bucket");
     * ```
     */
    async createBucket(bucketName: string): Promise<void> {
        try {
            await this.client.makeBucket(bucketName);
            this.logger.info(
                {
                    bucket: bucketName,
                },
                "Bucket created"
            );
        } catch (error) {
            this.logger.error(
                {
                    error,
                    bucket: bucketName,
                },
                "Error creating bucket"
            );
            throw error;
        }
    }

    /**
     * Delete a bucket (must be empty)
     *
     * @param bucketName - Name of the bucket
     * @throws Error if bucket deletion fails
     *
     * @example
     * ```ts
     * await storageService.deleteBucket("my-bucket");
     * ```
     */
    async deleteBucket(bucketName: string): Promise<void> {
        try {
            await this.client.removeBucket(bucketName);
            this.logger.info(
                {
                    bucket: bucketName,
                },
                "Bucket deleted"
            );
        } catch (error) {
            this.logger.error(
                {
                    error,
                    bucket: bucketName,
                },
                "Error deleting bucket"
            );
            throw error;
        }
    }

    /**
     * Check MinIO connection
     *
     * @returns True if connection is successful, false otherwise
     *
     * @example
     * ```ts
     * const isConnected = await storageService.checkConnection();
     * ```
     */
    async checkConnection(): Promise<boolean> {
        try {
            // Try to list buckets as a lightweight health check
            // This verifies the connection is working without creating/checking specific buckets
            await this.client.listBuckets();
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Convert a readable stream to a Buffer
     *
     * @param stream - Readable stream
     * @returns Buffer containing stream data
     * @private
     */
    private async streamToBuffer(stream: Readable): Promise<Buffer> {
        const chunks: Buffer[] = [];

        return new Promise<Buffer>((resolve, reject) => {
            stream.on("data", (chunk: Buffer) => {
                chunks.push(chunk);
            });

            stream.on("end", () => {
                resolve(Buffer.concat(chunks));
            });

            stream.on("error", (error: Error) => {
                reject(error);
            });
        });
    }
}
