/**
 * Storage Client
 *
 * Storage client instance using @backtrade/storage package.
 * This file provides a singleton storage service for the API application.
 */

import { createStorageClient, createStorageService } from "@backtrade/storage";
import { logger } from "./pino";

// Create storage client and service instances
const storageClient = createStorageClient({ logger });
export const storageService = createStorageService({
    client: storageClient,
    logger,
});
