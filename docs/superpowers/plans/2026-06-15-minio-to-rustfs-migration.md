# MinIO → RustFS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace MinIO with RustFS (S3-compatible) across the entire BackTrade monorepo — switching the Node `minio` client to `@aws-sdk/client-s3`, renaming app env vars `MINIO_* → S3_*`, dropping all TLS/SSL, and updating Docker, env, utils, and docs so no functional MinIO reference remains.

**Architecture:** The `@backtrade/storage` package keeps the exact `StorageService` public method surface; only its internals move from minio calls to AWS S3 SDK commands and its client factory returns an `S3Client`. Consumers change only in env-var references and comment wording. RustFS replaces the MinIO container in both compose files. Plain HTTP only — no certs.

**Tech Stack:** TypeScript (strict, ESM), `@aws-sdk/client-s3`, Zod env validation, Docker Compose, pnpm workspaces + Turbo. Toolchain runs **inside the `tools` container**.

**Note on testing:** `@backtrade/storage` ships only a placeholder unit test and has no integration harness against the object store (the storage client talks to a live server). Per-task verification therefore relies on `typecheck` + `lint` gates and a final repo-wide `grep` completeness check, with an optional end-to-end smoke test (Task 11). This is intentional, not an omission.

**Command prefix:** All pnpm/tooling commands run in the tools container. Prefix is:
`docker compose -f docker-dev.yaml exec tools <cmd>`
The stack must be up (`make dev`) for these to work.

---

## File Structure

**Rewritten / renamed (package):**

- `packages/storage/src/libs/s3-client.ts` (renamed from `minio-client.ts`) — S3 client factory.
- `packages/storage/src/services/storage-service.ts` — same API, S3 SDK internals.
- `packages/storage/src/config/ENV.ts` — `S3_*` schema.
- `packages/storage/src/index.ts` — exports/JSDoc.
- `packages/storage/package.json` — dep swap.

**Edited (consumers):** `apps/api/src/config/env.ts`, `apps/worker/src/config/env.ts`, `apps/api/src/libs/storage.ts`, `apps/worker/src/libs/storage.ts`, `apps/api/src/services/base/datasets-service.ts`, `apps/api/src/services/utils/health-service.ts`, `apps/worker/src/processor/dataset-file-split-processor.ts`, `apps/worker/src/processor/dataset-part-processor.ts`, `packages/types/src/entities/dataset-processing.ts`.

**Infra:** `docker/images/rustfs.dockerfile` (renamed), remove `docker/config/minio/`, `docker-dev.yaml`, `docker-prod.yaml`, `.env.example`, delete `utils/generate_minio_certs.{bat,sh}`.

**Docs:** `README.md`, `CLAUDE.md`, `documentation/**`.

---

## Task 1: Swap the storage package dependency

**Files:**

- Modify: `packages/storage/package.json:29`

- [ ] **Step 1: Replace the minio dependency**

In `packages/storage/package.json`, change the `dependencies` block from:

```json
    "dependencies": {
        "@backtrade/logger": "workspace:*",
        "minio": "^8.0.7",
        "zod": "4.4.3"
    },
```

to:

```json
    "dependencies": {
        "@aws-sdk/client-s3": "^3.700.0",
        "@backtrade/logger": "workspace:*",
        "zod": "4.4.3"
    },
```

- [ ] **Step 2: Install dependencies**

Run: `make install-dev`
Expected: pnpm resolves `@aws-sdk/client-s3`, removes `minio`, updates `pnpm-lock.yaml`. No errors.

- [ ] **Step 3: Verify minio is gone from the lockfile for this package**

Run: `docker compose -f docker-dev.yaml exec tools pnpm --filter @backtrade/storage list minio`
Expected: no `minio` entry (command reports it is not installed).

- [ ] **Step 4: Commit**

```bash
git add packages/storage/package.json pnpm-lock.yaml
git commit -m "chore(deps): replace minio with @aws-sdk/client-s3 in storage"
```

---

## Task 2: Rewrite the storage env schema

**Files:**

- Modify: `packages/storage/src/config/ENV.ts`

- [ ] **Step 1: Replace the entire file**

Replace the full contents of `packages/storage/src/config/ENV.ts` with:

```ts
import { z } from "zod";

const EnvSchema = z.object({
    S3_HOST: z.string(),
    S3_PORT: z.coerce.number().int().positive(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_REGION: z.string().default("us-east-1"),
});

export const ENV = EnvSchema.parse(process.env);
```

- [ ] **Step 2: Commit**

```bash
git add packages/storage/src/config/ENV.ts
git commit -m "refactor(storage): replace minio env schema with s3 vars"
```

---

## Task 3: Replace the client factory (minio-client.ts → s3-client.ts)

**Files:**

- Create: `packages/storage/src/libs/s3-client.ts`
- Delete: `packages/storage/src/libs/minio-client.ts`

- [ ] **Step 1: Create the new S3 client factory**

Create `packages/storage/src/libs/s3-client.ts` with:

````ts
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
````

- [ ] **Step 2: Delete the old minio client**

Run: `git rm packages/storage/src/libs/minio-client.ts`
Expected: file removed.

- [ ] **Step 3: Commit**

```bash
git add packages/storage/src/libs/s3-client.ts
git commit -m "refactor(storage): replace minio client factory with s3 client"
```

---

## Task 4: Rewrite the storage service internals

**Files:**

- Modify: `packages/storage/src/services/storage-service.ts` (full rewrite, same public API)

- [ ] **Step 1: Replace the entire file**

Replace the full contents of `packages/storage/src/services/storage-service.ts` with:

```ts
/**
 * Storage Service
 *
 * Handles file storage operations against RustFS via the AWS S3 SDK.
 * Provides a clean interface for uploading, downloading, deleting, and
 * managing files.
 */

import {
    S3Client,
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
```

- [ ] **Step 2: Commit**

```bash
git add packages/storage/src/services/storage-service.ts
git commit -m "refactor(storage): reimplement storage service with s3 sdk"
```

---

## Task 5: Update the package barrel exports

**Files:**

- Modify: `packages/storage/src/index.ts`

- [ ] **Step 1: Replace the entire file**

Replace the full contents of `packages/storage/src/index.ts` with:

````ts
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
````

- [ ] **Step 2: Typecheck the package**

Run: `docker compose -f docker-dev.yaml exec tools pnpm --filter @backtrade/storage typecheck`
Expected: PASS, no errors.

- [ ] **Step 3: Lint the package**

Run: `docker compose -f docker-dev.yaml exec tools pnpm --filter @backtrade/storage lint`
Expected: PASS, no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/storage/src/index.ts
git commit -m "refactor(storage): update barrel exports for s3 client"
```

---

## Task 6: Update API env schema and storage lib

**Files:**

- Modify: `apps/api/src/config/env.ts:39-44`
- Modify: `apps/api/src/libs/storage.ts`

- [ ] **Step 1: Replace the MINIO block in the API env schema**

In `apps/api/src/config/env.ts`, replace:

```ts
    MINIO_HOST: z.string(),
    MINIO_PORT: z.coerce.number().int().positive(),
    MINIO_USER: z.string(),
    MINIO_PASSWORD: z.string(),
    MINIO_CA_CERT_PATH: z.string().optional(),
    MINIO_DATASETS_BUCKET: z.string().default("datasets"),
```

with:

```ts
    S3_HOST: z.string(),
    S3_PORT: z.coerce.number().int().positive(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_REGION: z.string().default("us-east-1"),
    S3_DATASETS_BUCKET: z.string().default("datasets"),
```

- [ ] **Step 2: Update the API storage lib comment**

In `apps/api/src/libs/storage.ts`, change the variable name and comment so it reads:

```ts
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
```

(No functional change — `storageClient` stays the variable name; this file already has no MinIO-specific text. Confirm it matches; if it already matches, no edit is needed.)

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/config/env.ts apps/api/src/libs/storage.ts
git commit -m "refactor(api): switch storage env vars to s3 naming"
```

---

## Task 7: Update API datasets-service and health-service references

**Files:**

- Modify: `apps/api/src/services/base/datasets-service.ts`
- Modify: `apps/api/src/services/utils/health-service.ts`

- [ ] **Step 1: Replace the env var reference in datasets-service**

In `apps/api/src/services/base/datasets-service.ts`, replace both occurrences of `ENV.MINIO_DATASETS_BUCKET` with `ENV.S3_DATASETS_BUCKET` (at the `storageService.upload(...)` call and the `filePath:` template literal).

- [ ] **Step 2: Update MinIO wording in datasets-service comments/logs**

In the same file, replace the user-facing "MinIO" strings:

- comment `In-memory ... Uploads the file to MinIO and creates a queue job for processing.` → `... Uploads the file to RustFS (S3) and creates a queue job for processing.`
- comment `// Build file path in MinIO: datasets/{datasetId}/raw/{filename}` → `// Build file path in storage: datasets/{datasetId}/raw/{filename}`
- log message `"Uploading dataset file to MinIO"` → `"Uploading dataset file to storage"`
- comment `// Upload file to MinIO` → `// Upload file to storage`
- log message `"File uploaded to MinIO successfully"` → `"File uploaded to storage successfully"`

- [ ] **Step 3: Update MinIO wording in health-service**

In `apps/api/src/services/utils/health-service.ts`, change the comment `Checks storage (MinIO) connectivity` → `Checks storage (RustFS/S3) connectivity`.

- [ ] **Step 4: Typecheck the API**

Run: `docker compose -f docker-dev.yaml exec tools pnpm --filter @backtrade/api typecheck`
Expected: PASS, no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/services/base/datasets-service.ts apps/api/src/services/utils/health-service.ts
git commit -m "refactor(api): update storage references from minio to s3"
```

---

## Task 8: Update worker env schema, storage lib, and processors

**Files:**

- Modify: `apps/worker/src/config/env.ts:35-40`
- Modify: `apps/worker/src/libs/storage.ts`
- Modify: `apps/worker/src/processor/dataset-file-split-processor.ts`
- Modify: `apps/worker/src/processor/dataset-part-processor.ts`

- [ ] **Step 1: Replace the MINIO block in the worker env schema**

In `apps/worker/src/config/env.ts`, replace:

```ts
    // MinIO configuration for storage operations
    MINIO_HOST: z.string(),
    MINIO_PORT: z.coerce.number().int().positive(),
    MINIO_USER: z.string(),
    MINIO_PASSWORD: z.string(),
    MINIO_CA_CERT_PATH: z.string().optional(),
```

with:

```ts
    // S3 (RustFS) configuration for storage operations
    S3_HOST: z.string(),
    S3_PORT: z.coerce.number().int().positive(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_REGION: z.string().default("us-east-1"),
```

- [ ] **Step 2: Confirm worker storage lib needs no MinIO edits**

Open `apps/worker/src/libs/storage.ts`. It contains no MinIO-specific text (only the `@backtrade/storage` factory calls). No edit required.

- [ ] **Step 3: Update MinIO wording in dataset-file-split-processor**

In `apps/worker/src/processor/dataset-file-split-processor.ts`, replace the "MinIO" strings:

- header comment `Each part is uploaded to MinIO and a processing job is queued immediately,` → `Each part is uploaded to storage and a processing job is queued immediately,`
- comment `Upload a part to MinIO and queue its processing job` → `Upload a part to storage and queue its processing job`
- log message `"Uploading part to MinIO"` → `"Uploading part to storage"`
- comment `Streams the file from MinIO, splits it into parts progressively,` → `Streams the file from storage, splits it into parts progressively,`
- comment `// Get file stream from MinIO` → `// Get file stream from storage`
- log message `"Creating file stream from MinIO"` → `"Creating file stream from storage"`

- [ ] **Step 4: Update MinIO wording in dataset-part-processor**

In `apps/worker/src/processor/dataset-part-processor.ts`, replace:

- comment `Downloads the part from MinIO, parses the CSV lines,` → `Downloads the part from storage, parses the CSV lines,`
- comment `// Download part from MinIO` → `// Download part from storage`
- log message `"Downloading part from MinIO"` → `"Downloading part from storage"`

- [ ] **Step 5: Typecheck the worker**

Run: `docker compose -f docker-dev.yaml exec tools pnpm --filter @backtrade/worker typecheck`
Expected: PASS, no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/worker/src/config/env.ts apps/worker/src/processor/dataset-file-split-processor.ts apps/worker/src/processor/dataset-part-processor.ts
git commit -m "refactor(worker): update storage references from minio to s3"
```

---

## Task 9: Update the shared types comments

**Files:**

- Modify: `packages/types/src/entities/dataset-processing.ts:19,39`

- [ ] **Step 1: Replace the MinIO wording**

In `packages/types/src/entities/dataset-processing.ts`:

- `/** Path to the raw file in MinIO (e.g., "datasets/1/raw/file.csv") */` → `/** Path to the raw file in storage (e.g., "datasets/1/raw/file.csv") */`
- `/** Path to the part file in MinIO (e.g., "datasets/1/parts/part_0.csv") */` → `/** Path to the part file in storage (e.g., "datasets/1/parts/part_0.csv") */`

- [ ] **Step 2: Commit**

```bash
git add packages/types/src/entities/dataset-processing.ts
git commit -m "docs(types): update storage path comments to drop minio"
```

---

## Task 10: Migrate Docker, env, and utils to RustFS

**Files:**

- Create: `docker/images/rustfs.dockerfile`
- Delete: `docker/images/minio.dockerfile`, `docker/config/minio/` (directory), `utils/generate_minio_certs.bat`, `utils/generate_minio_certs.sh`
- Modify: `docker-dev.yaml`, `docker-prod.yaml`, `.env.example`

- [ ] **Step 1: Create the RustFS dockerfile**

Create `docker/images/rustfs.dockerfile` with:

```dockerfile
FROM rustfs/rustfs:latest
```

(The base image ships its own entrypoint/CMD; volumes, console address, and credentials are supplied via compose.)

- [ ] **Step 2: Delete the old MinIO image, config, and cert scripts**

Run:

```bash
git rm docker/images/minio.dockerfile
git rm -r docker/config/minio
git rm utils/generate_minio_certs.bat utils/generate_minio_certs.sh
```

Expected: all removed.

- [ ] **Step 3: Replace the minio service in docker-dev.yaml**

In `docker-dev.yaml`, replace the `minio:` service block (currently lines ~102-118) with:

```yaml
rustfs:
    build:
        context: .
        dockerfile: ./docker/images/rustfs.dockerfile
    ports:
        - "9000:9000"
        - "9001:9001"
    environment:
        RUSTFS_ACCESS_KEY: ${RUSTFS_ACCESS_KEY}
        RUSTFS_SECRET_KEY: ${RUSTFS_SECRET_KEY}
        RUSTFS_VOLUMES: /data
        RUSTFS_ADDRESS: 0.0.0.0:9000
        RUSTFS_CONSOLE_ADDRESS: 0.0.0.0:9001
        RUSTFS_CONSOLE_ENABLE: "true"
    volumes:
        - backtrade_rustfs_data:/data
    networks:
        backtrade:
            ipv4_address: 192.168.250.23
    restart: always
```

- [ ] **Step 4: Rename the dev volume**

In `docker-dev.yaml`, in the top-level `volumes:` block, replace:

```yaml
backtrade_minio_data:
    driver: local
```

with:

```yaml
backtrade_rustfs_data:
    driver: local
```

- [ ] **Step 5: Replace the minio service in docker-prod.yaml**

In `docker-prod.yaml`, replace the `# MinIO Object Storage` / `minio:` service block (currently lines ~503-546) with:

```yaml
# =========================================================================
# RustFS Object Storage (S3-compatible)
# =========================================================================
rustfs:
    build:
        context: .
        dockerfile: docker/images/rustfs.dockerfile
    environment:
        RUSTFS_ACCESS_KEY: ${RUSTFS_ACCESS_KEY}
        RUSTFS_SECRET_KEY: ${RUSTFS_SECRET_KEY}
        RUSTFS_VOLUMES: /data
        RUSTFS_ADDRESS: 0.0.0.0:9000
        RUSTFS_CONSOLE_ADDRESS: 0.0.0.0:9001
        RUSTFS_CONSOLE_ENABLE: "true"
    volumes:
        - backtrade_rustfs_data:/data
    networks:
        backend:
            ipv4_address: 192.168.250.23
    restart: unless-stopped
    healthcheck:
        test: ["CMD", "curl", "-f", "http://localhost:9000/health"]
        interval: 30s
        timeout: 10s
        retries: 3
        start_period: 40s
    deploy:
        resources:
            limits:
                cpus: "1.0"
                memory: 4G
            reservations:
                cpus: "0.25"
                memory: 512M
    cap_drop:
        - ALL
    security_opt:
        - no-new-privileges:true
    logging:
        driver: "json-file"
        options:
            max-size: "10m"
            max-file: "3"
```

- [ ] **Step 6: Verify the RustFS image healthcheck command**

The RustFS image may not ship `curl`. Run, after Step 11 brings the stack up (or run now against a one-off container):

```bash
docker run --rm --entrypoint sh rustfs/rustfs:latest -c "command -v curl || command -v wget || echo NONE"
```

Expected: prints a path to `curl` or `wget`, or `NONE`.

- If `wget` only: change the healthcheck test to `["CMD", "wget", "-q", "--spider", "http://localhost:9000/health"]`.
- If `NONE`: change to `["CMD-SHELL", "exec 3<>/dev/tcp/localhost/9000"]` as a TCP-liveness fallback.

- [ ] **Step 7: Replace MINIO env injection for api/worker in docker-prod.yaml**

In `docker-prod.yaml`, there are blocks injecting MinIO vars into the api and worker services. Replace each MinIO block:

```yaml
MINIO_HOST: ${MINIO_HOST}
MINIO_PORT: ${MINIO_PORT}
MINIO_USER: ${MINIO_USER}
MINIO_PASSWORD: ${MINIO_PASSWORD}
MINIO_CA_CERT_PATH: ${MINIO_CA_CERT_PATH}
MINIO_DATASETS_BUCKET: ${MINIO_DATASETS_BUCKET}
```

with (for the api service, which had the datasets bucket):

```yaml
S3_HOST: ${S3_HOST}
S3_PORT: ${S3_PORT}
S3_ACCESS_KEY_ID: ${S3_ACCESS_KEY_ID}
S3_SECRET_ACCESS_KEY: ${S3_SECRET_ACCESS_KEY}
S3_REGION: ${S3_REGION}
S3_DATASETS_BUCKET: ${S3_DATASETS_BUCKET}
```

And the worker block (which had no datasets bucket and used `MINIO_CA_CERT_PATH`):

```yaml
MINIO_HOST: ${MINIO_HOST}
MINIO_PORT: ${MINIO_PORT}
MINIO_USER: ${MINIO_USER}
MINIO_PASSWORD: ${MINIO_PASSWORD}
MINIO_CA_CERT_PATH: ${MINIO_CA_CERT_PATH}
```

with:

```yaml
S3_HOST: ${S3_HOST}
S3_PORT: ${S3_PORT}
S3_ACCESS_KEY_ID: ${S3_ACCESS_KEY_ID}
S3_SECRET_ACCESS_KEY: ${S3_SECRET_ACCESS_KEY}
S3_REGION: ${S3_REGION}
```

- [ ] **Step 8: Update depends_on and prod volume name**

In `docker-prod.yaml`:

- replace both `depends_on` entries referencing `minio:` with `rustfs:` (keep any condition such as `condition: service_healthy`).
- in the top-level `volumes:` block, replace `backtrade_minio_data:` with `backtrade_rustfs_data:`.

- [ ] **Step 9: Replace the MinIO block in .env.example**

In `.env.example`, replace lines 40-51:

```bash
# Minio Configuration
MINIO_ROOT_USER=minioUser
MINIO_ROOT_PASSWORD=minioPassword
MINIO_HOST=192.168.250.23
MINIO_PORT=9000
MINIO_USE_SSL=false

MINIO_USER=minioUser
MINIO_PASSWORD=minioPassword
MINIO_CA_CERT_PATH=./docker/config/minio/certs/public.crt

MINIO_DATASETS_BUCKET=datasets
```

with:

```bash
# RustFS (S3-compatible) Object Storage
# Server credentials (consumed by the rustfs container)
RUSTFS_ACCESS_KEY=rustfsadmin
RUSTFS_SECRET_KEY=rustfsadmin

# S3 client configuration (consumed by api/worker via @backtrade/storage)
# Keys must match the RustFS server credentials above.
S3_HOST=192.168.250.23
S3_PORT=9000
S3_ACCESS_KEY_ID=rustfsadmin
S3_SECRET_ACCESS_KEY=rustfsadmin
S3_REGION=us-east-1
S3_DATASETS_BUCKET=datasets
```

- [ ] **Step 10: Validate both compose files**

Run:

```bash
docker compose -f docker-dev.yaml config >/dev/null && echo DEV_OK
docker compose -f docker-prod.yaml config >/dev/null && echo PROD_OK
```

Expected: `DEV_OK` and `PROD_OK` (no YAML/interpolation errors). Set any missing `S3_*`/`RUSTFS_*` vars in your local `.env` first (copy from `.env.example`).

- [ ] **Step 11: Commit**

```bash
git add docker/images/rustfs.dockerfile docker-dev.yaml docker-prod.yaml .env.example
git commit -m "feat(docker): replace minio with rustfs object storage"
```

---

## Task 11: Update documentation

**Files:**

- Modify: `README.md`, `CLAUDE.md`, and every `documentation/**` file containing "MinIO"/"minio".

- [ ] **Step 1: List the remaining doc references**

Run: `grep -rli "minio" README.md CLAUDE.md documentation/`
Expected: a list including `README.md`, `CLAUDE.md`, and files under `documentation/monorepo/`, `documentation/dataset-processing/`, `documentation/error-handling/`, `documentation/backend-api/`, `documentation/docker/prod/`.

- [ ] **Step 2: Update each doc file**

For each file, replace MinIO references with RustFS/S3 terminology consistent with the new design:

- Service/storage descriptions: "MinIO" → "RustFS (S3-compatible)".
- Env-var mentions: `MINIO_*` → `S3_*` (and server creds `RUSTFS_ACCESS_KEY`/`RUSTFS_SECRET_KEY`).
- Client mentions: "minio client" → "AWS S3 client (`@aws-sdk/client-s3`)".
- Remove any TLS/CA-cert (`MINIO_CA_CERT_PATH`, `MINIO_USE_SSL`, cert-generation) guidance — RustFS runs over plain HTTP here.
- In `CLAUDE.md`, update the MinIO console line (`MinIO console http://localhost:9001`) to "RustFS console http://localhost:9001" and any `@backtrade/storage` description mentioning MinIO.

- [ ] **Step 3: Verify docs no longer mention MinIO**

Run: `grep -rli "minio" README.md CLAUDE.md documentation/`
Expected: no output (empty).

- [ ] **Step 4: Commit**

```bash
git add README.md CLAUDE.md documentation/
git commit -m "docs: update storage docs from minio to rustfs"
```

---

## Task 12: Repo-wide completeness verification

**Files:** none (verification only).

- [ ] **Step 1: Full lint + typecheck**

Run:

```bash
make lint
make typecheck
```

Expected: both PASS across the monorepo.

- [ ] **Step 2: Repo-wide MinIO grep**

Run: `grep -rli "minio" . --exclude-dir=node_modules --exclude-dir=.git`
Expected: matches **only** under `docs/superpowers/` (historical task records: the split-dev-containers plan/spec, this migration's spec/plan) and `THIRD_PARTY_LICENSES.txt` / `pnpm-lock.yaml` only if `make install-dev` has not yet regenerated them. If `THIRD_PARTY_LICENSES.txt` still lists minio, regenerate it (it is produced by the build tooling) and re-run. No source, config, env, Docker, or `documentation/` file may match.

- [ ] **Step 3: Optional end-to-end smoke test**

Run: `make dev` (if not already up), wait for health, then:

```bash
curl -s http://localhost:21799/api/v1/health | grep -o '"storage":[^,}]*'
```

Expected: storage reports healthy/connected. Optionally upload a dataset through the UI/API and confirm the file round-trips (the `datasets` bucket is auto-created by `ensureBucket`).

- [ ] **Step 4: Final commit (if regeneration changed tracked files)**

```bash
git add -A
git commit -m "chore(deps): regenerate lockfile and third-party licenses after rustfs migration"
```

---

## Self-Review Notes

- **Spec coverage:** Package rewrite (Tasks 1-5), consumers (6-9), Docker/env/utils (10), docs (11), verification (12) — every spec section maps to a task.
- **Type consistency:** `S3ClientConfig`, `StorageServiceConfig.client: S3Client`, `FileStat`, and `createStorageClient`/`createStorageService` names are consistent across Tasks 3-5 and unchanged for consumers.
- **No SSL anywhere:** `MINIO_USE_SSL`/`MINIO_CA_CERT_PATH` removed from package ENV, both app envs, both compose files, and `.env.example`; cert scripts deleted.
- **Env var parity:** `S3_DATASETS_BUCKET` lives in the API env + prod api injection only (worker never used the bucket var), matching current usage.
