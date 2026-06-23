/**
 * S3 Client Factory
 *
 * Creates and configures AWS S3 client instances pointed at RustFS
 * (S3-compatible object storage). Accepts a logger for dependency injection
 * and reads S3 configuration from environment.
 */

import { S3Client } from "@aws-sdk/client-s3";
import type { Logger } from "@backtrade/logger";
import { ENV } from "../config/ENV";

/**
 * S3 client configuration options
 */
export interface S3ClientConfig {
    /** Logger instance from the consuming application */
    logger: Logger;
}

/**
 * Creates an S3 client instance configured for RustFS.
 *
 * @param config - Configuration object with logger
 * @returns Configured S3Client instance
 *
 * @example
 * ```ts
 * import { createStorageClient } from "@backtrade/storage";
 * import { logger } from "./libs/pino";
 *
 * const s3Client = createStorageClient({ logger });
 * ```
 */
export function createStorageClient(config: S3ClientConfig): S3Client {
    const storageLogger = config.logger.child({
        service: "s3-client",
    });

    const client = new S3Client({
        endpoint: `http://${ENV.S3_HOST}:${ENV.S3_PORT}`,
        region: ENV.S3_REGION,
        credentials: {
            accessKeyId: ENV.S3_ACCESS_KEY_ID,
            secretAccessKey: ENV.S3_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true,
    });

    storageLogger.info(
        {
            host: ENV.S3_HOST,
            port: ENV.S3_PORT,
            region: ENV.S3_REGION,
        },
        "S3 client created successfully"
    );

    return client;
}
