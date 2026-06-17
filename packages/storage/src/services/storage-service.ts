/**
 * Storage Service
 *
 * Handles file storage operations against RustFS via the AWS S3 SDK.
 * Provides a clean interface for uploading, downloading, deleting, and
 * managing files.
 */

import {
    type S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
    HeadBucketCommand,
    CreateBucketCommand,
    DeleteBucketCommand,
    ListBucketsCommand,
} from "@aws-sdk/client-s3";
import type { Readable } from "stream";
import type { Logger } from "@backtrade/logger";

/**
 * Storage service configuration
 */
export interface StorageServiceConfig {
    /** S3 client instance */
    client: S3Client;
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
 * File metadata and statistics
 */
export interface FileStat {
    /** Size of the object in bytes */
    size: number;
    /** Last modified timestamp */
    lastModified?: Date;
    /** Entity tag */
    etag?: string;
    /** User metadata attached to the object */
    metadata?: Record<string, string>;
}

/**
 * Returns true if an S3 SDK error represents a missing object/bucket (404).
 */
function isNotFoundError(error: unknown): boolean {
    if (error && typeof error === "object") {
        const err = error as {
            name?: string;
            $metadata?: { httpStatusCode?: number };
        };
        if (err.name === "NotFound" || err.name === "NoSuchKey") {
            return true;
        }
        if (err.$metadata?.httpStatusCode === 404) {
            return true;
        }
    }
    return false;
}

/**
 * Storage Service
 *
 * Handles file storage operations against RustFS via the AWS S3 SDK.
 */
export class StorageService {
    private readonly client: S3Client;
    private readonly logger: ReturnType<Logger["child"]>;

    constructor(config: StorageServiceConfig) {
        this.client = config.client;
        this.logger = config.logger.child({
            service: "storage-service",
        });
    }

    /**
     * Upload a file.
     *
     * @param bucketName - Name of the bucket
     * @param fileName - Name/path of the file in the bucket
     * @param file - File content as Buffer
     * @param options - Optional upload options (contentType, metadata)
     * @throws Error if upload fails
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

            await this.client.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: fileName,
                    Body: file,
                    ContentLength: file.length,
                    ContentType: options?.contentType,
                    Metadata: options?.metadata,
                })
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
     * Download a file as a Buffer.
     *
     * @param bucketName - Name of the bucket
     * @param fileName - Name/path of the file in the bucket
     * @returns File content as Buffer
     * @throws Error if download fails or file doesn't exist
     */
    async download(bucketName: string, fileName: string): Promise<Buffer> {
        try {
            const response = await this.client.send(
                new GetObjectCommand({
                    Bucket: bucketName,
                    Key: fileName,
                })
            );

            const buffer = await this.streamToBuffer(response.Body as Readable);

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
     * Get a file as a readable stream.
     * Useful for large files to avoid loading entire file into memory.
     *
     * @param bucketName - Name of the bucket
     * @param fileName - Name/path of the file in the bucket
     * @returns Readable stream of the file
     * @throws Error if stream creation fails or file doesn't exist
     */
    async getObjectStream(
        bucketName: string,
        fileName: string
    ): Promise<Readable> {
        try {
            const response = await this.client.send(
                new GetObjectCommand({
                    Bucket: bucketName,
                    Key: fileName,
                })
            );

            this.logger.debug(
                {
                    bucket: bucketName,
                    fileName,
                },
                "File stream created"
            );

            return response.Body as Readable;
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
     * Delete a file.
     *
     * @param bucketName - Name of the bucket
     * @param fileName - Name/path of the file in the bucket
     * @throws Error if deletion fails
     */
    async delete(bucketName: string, fileName: string): Promise<void> {
        try {
            await this.client.send(
                new DeleteObjectCommand({
                    Bucket: bucketName,
                    Key: fileName,
                })
            );

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
     * Check if a file exists.
     *
     * @param bucketName - Name of the bucket
     * @param fileName - Name/path of the file in the bucket
     * @returns True if file exists, false otherwise
     */
    async exists(bucketName: string, fileName: string): Promise<boolean> {
        try {
            await this.client.send(
                new HeadObjectCommand({
                    Bucket: bucketName,
                    Key: fileName,
                })
            );
            return true;
        } catch (error) {
            if (isNotFoundError(error)) {
                return false;
            }
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
     * Get file metadata and statistics.
     *
     * @param bucketName - Name of the bucket
     * @param fileName - Name/path of the file in the bucket
     * @returns File statistics (size, lastModified, etag, metadata)
     * @throws Error if file doesn't exist or stat fails
     */
    async stat(bucketName: string, fileName: string): Promise<FileStat> {
        try {
            const response = await this.client.send(
                new HeadObjectCommand({
                    Bucket: bucketName,
                    Key: fileName,
                })
            );

            const stat: FileStat = {
                size: response.ContentLength ?? 0,
                lastModified: response.LastModified,
                etag: response.ETag,
                metadata: response.Metadata,
            };

            this.logger.debug(
                {
                    bucket: bucketName,
                    fileName,
                    size: stat.size,
                },
                "File stats retrieved"
            );

            return stat;
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
     * Check if a bucket exists.
     *
     * @param bucketName - Name of the bucket
     * @returns True if bucket exists, false otherwise
     */
    async bucketExists(bucketName: string): Promise<boolean> {
        try {
            await this.client.send(
                new HeadBucketCommand({
                    Bucket: bucketName,
                })
            );
            return true;
        } catch (error) {
            if (isNotFoundError(error)) {
                return false;
            }
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
     * Ensure a bucket exists, create it if it doesn't.
     *
     * @param bucketName - Name of the bucket
     * @throws Error if bucket creation fails
     */
    async ensureBucket(bucketName: string): Promise<void> {
        try {
            const exists = await this.bucketExists(bucketName);
            if (!exists) {
                await this.client.send(
                    new CreateBucketCommand({
                        Bucket: bucketName,
                    })
                );
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
     * Create a bucket (fails if bucket already exists).
     *
     * @param bucketName - Name of the bucket
     * @throws Error if bucket creation fails or bucket already exists
     */
    async createBucket(bucketName: string): Promise<void> {
        try {
            await this.client.send(
                new CreateBucketCommand({
                    Bucket: bucketName,
                })
            );
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
     * Delete a bucket (must be empty).
     *
     * @param bucketName - Name of the bucket
     * @throws Error if bucket deletion fails
     */
    async deleteBucket(bucketName: string): Promise<void> {
        try {
            await this.client.send(
                new DeleteBucketCommand({
                    Bucket: bucketName,
                })
            );
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
     * Check storage connection.
     *
     * @returns True if connection is successful, false otherwise
     */
    async checkConnection(): Promise<boolean> {
        try {
            await this.client.send(new ListBucketsCommand({}));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Convert a readable stream to a Buffer.
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
