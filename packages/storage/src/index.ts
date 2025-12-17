/**
 * @backtrade/storage
 *
 * Shared storage package for BackTrade.
 * Contains MinIO client initialization and file storage operations.
 *
 * @example
 * ```ts
 * import { createStorageClient, createStorageService } from "@backtrade/storage";
 * import { logger } from "./libs/pino";
 *
 * // Create storage client
 * const minioClient = createStorageClient({ logger });
 *
 * // Create storage service
 * const storageService = createStorageService({
 *   client: minioClient,
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
export { createStorageClient } from "./libs/minio-client";
export type { MinioClientConfig } from "./libs/minio-client";

// Storage service
import {
    StorageService,
    type StorageServiceConfig,
    type UploadOptions,
} from "./services/storage-service";
export { StorageService, type StorageServiceConfig, type UploadOptions };

/**
 * Factory function to create a storage service instance
 *
 * @param config - Configuration with MinIO client and logger
 * @returns StorageService instance
 */
export function createStorageService(
    config: StorageServiceConfig
): StorageService {
    return new StorageService(config);
}
