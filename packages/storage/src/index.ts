/**
 * @backtrade/storage
 *
 * Shared storage package for BackTrade.
 * Contains S3 client initialization (pointed at RustFS) and file storage
 * operations.
 *
 * @example
 * ```ts
 * import { createStorageClient, createStorageService } from "@backtrade/storage";
 * import { logger } from "./libs/pino";
 *
 * // Create storage client
 * const s3Client = createStorageClient({ logger });
 *
 * // Create storage service
 * const storageService = createStorageService({
 *   client: s3Client,
 *   logger
 * });
 *
 * // Upload a file
 * await storageService.upload(
 *   "my-bucket",
 *   "path/to/file.txt",
 *   Buffer.from("file content")
 * );
 *
 * // Download a file
 * const fileBuffer = await storageService.download("my-bucket", "path/to/file.txt");
 *
 * // Check if file exists
 * const exists = await storageService.exists("my-bucket", "path/to/file.txt");
 *
 * // Delete a file
 * await storageService.delete("my-bucket", "path/to/file.txt");
 * ```
 */

// Storage client factory
export { createStorageClient } from "./libs/s3-client";
export type { S3ClientConfig } from "./libs/s3-client";

// Storage service
import {
    StorageService,
    type StorageServiceConfig,
    type UploadOptions,
    type FileStat,
} from "./services/storage-service";
export {
    StorageService,
    type StorageServiceConfig,
    type UploadOptions,
    type FileStat,
};

/**
 * Factory function to create a storage service instance
 *
 * @param config - Configuration with S3 client and logger
 * @returns StorageService instance
 */
export function createStorageService(
    config: StorageServiceConfig
): StorageService {
    return new StorageService(config);
}
