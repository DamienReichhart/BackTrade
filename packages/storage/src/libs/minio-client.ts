/**
 * MinIO Client Factory
 *
 * Creates and configures MinIO client instances.
 * Accepts logger for dependency injection and reads MinIO configuration from environment.
 */

import * as Minio from "minio";
import type { Client } from "minio";
import type { Logger } from "@backtrade/logger";
import { ENV } from "../config/ENV";

/**
 * MinIO client configuration options
 */
export interface MinioClientConfig {
    /** Logger instance from the consuming application */
    logger: Logger;
}

/**
 * Creates a MinIO client instance with proper error handling and SSL configuration
 *
 * @param config - Configuration object with logger
 * @returns Configured MinIO client instance
 *
 * @example
 * ```ts
 * import { createStorageClient } from "@backtrade/storage";
 * import { logger } from "./libs/pino";
 *
 * const minioClient = createStorageClient({ logger });
 * ```
 */
export function createStorageClient(config: MinioClientConfig): Client {
    const storageLogger = config.logger.child({
        service: "minio-client",
    });

    const minioClient = new Minio.Client({
        endPoint: ENV.MINIO_HOST,
        port: ENV.MINIO_PORT,
        useSSL: ENV.MINIO_USE_SSL,
        accessKey: ENV.MINIO_USER,
        secretKey: ENV.MINIO_PASSWORD,
    });

    // Configure SSL certificate handling
    if (ENV.MINIO_USE_SSL) {
        if (ENV.MINIO_CA_CERT_PATH) {
            // If CA cert path is provided, use it
            minioClient.setRequestOptions({
                ca: ENV.MINIO_CA_CERT_PATH,
            });
            storageLogger.info(
                {
                    caCertPath: ENV.MINIO_CA_CERT_PATH,
                },
                "MinIO client configured with CA certificate"
            );
        } else {
            // For development with self-signed certificates
            minioClient.setRequestOptions({
                rejectUnauthorized: false,
            });
            storageLogger.warn(
                "MinIO client configured to accept self-signed certificates (development mode)"
            );
        }
    }

    storageLogger.info(
        {
            host: ENV.MINIO_HOST,
            port: ENV.MINIO_PORT,
            useSSL: ENV.MINIO_USE_SSL,
        },
        "MinIO client created successfully"
    );

    return minioClient;
}
