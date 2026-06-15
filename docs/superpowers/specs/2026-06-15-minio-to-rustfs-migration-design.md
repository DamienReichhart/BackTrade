# MinIO → RustFS Migration Design

**Date:** 2026-06-15
**Status:** Approved
**Scope:** Replace MinIO with RustFS across the entire BackTrade monorepo — application code, shared packages, Docker infrastructure, environment configuration, utilities, and documentation. The migration must be complete and permanent: no lingering MinIO names, dependencies, env vars, files, or references outside historical task records.

## Goals

- Swap the MinIO server for **RustFS** (`rustfs/rustfs:latest`), an S3-compatible object store.
- Replace the `minio` Node client with the AWS SDK **`@aws-sdk/client-s3`**.
- Rename all application-side storage env vars from `MINIO_*` to `S3_*`.
- **Drop TLS/SSL entirely** — plain HTTP only. No CA cert handling, no cert-generation scripts.
- Keep the `StorageService` public API identical so consumers need only cosmetic (comment / env-name) changes.

## Non-Goals

- No redesign of the storage service surface or upload/download flows.
- No data migration tooling (dev/prod buckets are recreated by `ensureBucket`).
- No changes to the `docs/superpowers/` historical records of prior tasks (they intentionally keep their original MinIO wording).

## Key Facts (RustFS)

- Image: `rustfs/rustfs:latest`
- S3 API port: `9000`; Console port: `9001`
- Data directory: `/data`
- Container env: `RUSTFS_ACCESS_KEY`, `RUSTFS_SECRET_KEY`, `RUSTFS_VOLUMES`, `RUSTFS_ADDRESS`, `RUSTFS_CONSOLE_ADDRESS`, `RUSTFS_CONSOLE_ENABLE`
- Health endpoint: `GET /health` (replaces MinIO's `/minio/health/live`)
- S3-compatible: AWS SDK works with `forcePathStyle: true`

## Architecture Decision

**Keep the `StorageService` public API identical; reimplement internals with the AWS S3 SDK.**

Rationale: consumers (`datasets-service`, the two worker processors, `health-service`) depend on the method surface, not the underlying client. Holding the surface stable means those files change only in comments and env-var references, minimizing risk while still fully removing MinIO.

## Changes

### 1. `packages/storage`

**`libs/minio-client.ts` → `libs/s3-client.ts`**
- `createStorageClient({ logger })` returns an `S3Client`:
  - `endpoint: http://${S3_HOST}:${S3_PORT}`
  - `region: S3_REGION`
  - `credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY }`
  - `forcePathStyle: true`
- No SSL/CA branch.
- Rename interface `MinioClientConfig → S3ClientConfig`.

**`services/storage-service.ts`** — same class name, same method signatures, reimplemented with SDK commands:
- `upload` → `PutObjectCommand` (sets `ContentType`, `Metadata`), preceded by `ensureBucket`.
- `download` → `GetObjectCommand`, stream body → `Buffer`.
- `getObjectStream` → `GetObjectCommand`, return body as `Readable`.
- `delete` → `DeleteObjectCommand`.
- `exists` → `HeadObjectCommand`; treat `NotFound` / HTTP 404 as `false`.
- `stat` → `HeadObjectCommand`; return a local `FileStat` interface (`size`, `lastModified`, `etag`, `metadata`) replacing minio's `BucketItemStat`.
- `bucketExists` → `HeadBucketCommand`.
- `ensureBucket` / `createBucket` → `CreateBucketCommand`.
- `deleteBucket` → `DeleteBucketCommand`.
- `checkConnection` → `ListBucketsCommand`.
- Keep the private `streamToBuffer` helper (adapt to the SDK body type).
- The `StorageServiceConfig.client` type becomes `S3Client`.

**`config/ENV.ts`** — new schema:
- `S3_HOST: string`
- `S3_PORT: coerce.number().int().positive()`
- `S3_ACCESS_KEY_ID: string`
- `S3_SECRET_ACCESS_KEY: string`
- `S3_REGION: string` default `"us-east-1"`
- `S3_DATASETS_BUCKET` is consumed in apps, not this package — keep package ENV limited to what the client needs.
- Remove `MINIO_USE_SSL`, `MINIO_CA_CERT_PATH`.

**`index.ts`** — update exports and JSDoc: export `createStorageClient`, `S3ClientConfig`; remove all "MinIO" wording.

**`package.json`** — remove `"minio"`, add `"@aws-sdk/client-s3"`.

### 2. Consumers (apps)

- `apps/api/src/config/env.ts`: `MINIO_HOST/PORT/USER/PASSWORD → S3_HOST/PORT/ACCESS_KEY_ID/SECRET_ACCESS_KEY`, add `S3_REGION`, `MINIO_DATASETS_BUCKET → S3_DATASETS_BUCKET`. Remove `MINIO_CA_CERT_PATH`.
- `apps/worker/src/config/env.ts`: same renames (no datasets bucket var there today; keep parity with what it uses). Remove `MINIO_CA_CERT_PATH`.
- `apps/api/src/libs/storage.ts`, `apps/worker/src/libs/storage.ts`: comment wording only (factory names unchanged).
- `apps/api/src/services/base/datasets-service.ts`: replace "MinIO" in comments/log strings with "RustFS"/"S3"; swap `ENV.MINIO_DATASETS_BUCKET → ENV.S3_DATASETS_BUCKET`.
- `apps/api/src/services/utils/health-service.ts`: comment wording ("MinIO" → "RustFS/S3").
- `apps/worker/src/processor/dataset-file-split-processor.ts`, `dataset-part-processor.ts`: comment/log wording.
- `packages/types/src/entities/dataset-processing.ts`: comment wording ("Path … in MinIO" → "… in S3").

### 3. Docker

- **`docker/images/minio.dockerfile` → `docker/images/rustfs.dockerfile`**: `FROM rustfs/rustfs:latest` (image provides its own entrypoint/CMD).
- **`docker/config/minio/`**: remove the directory (stale `config` reference file + cert `.gitignore` no longer needed; no TLS, no read-only config mount).
- **`docker-dev.yaml`**: `minio` service → `rustfs`:
  - same static IP `192.168.250.23`, ports `9000:9000` / `9001:9001`
  - env: `RUSTFS_ACCESS_KEY`, `RUSTFS_SECRET_KEY`, `RUSTFS_VOLUMES=/data`, `RUSTFS_CONSOLE_ADDRESS=0.0.0.0:9001`, `RUSTFS_CONSOLE_ENABLE=true`
  - volume `backtrade_minio_data → backtrade_rustfs_data` at `/data`; drop the `:/mnt/minio:ro` mount
  - update the named volume in the top-level `volumes:` block
- **`docker-prod.yaml`**:
  - `minio` service → `rustfs` (same rename as dev, plus existing prod hardening: `cap_drop`, `no-new-privileges`, resource limits, logging)
  - api/worker env injection blocks: `MINIO_* → S3_*`, dropping `MINIO_CA_CERT_PATH` and `MINIO_USE_SSL`; `MINIO_DATASETS_BUCKET → S3_DATASETS_BUCKET`
  - `depends_on: minio → rustfs` (both occurrences)
  - healthcheck: `http://localhost:9000/minio/health/live → http://localhost:9000/health` (verify the image ships `curl`/`wget` during implementation; switch command form if not)
  - volume rename `backtrade_minio_data → backtrade_rustfs_data` (service mount + top-level `volumes:`)

### 4. Environment & utilities

- **`.env.example`**: replace the MinIO block with:
  - RustFS server block: `RUSTFS_ACCESS_KEY`, `RUSTFS_SECRET_KEY`
  - S3 client block: `S3_HOST=192.168.250.23`, `S3_PORT=9000`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION=us-east-1`, `S3_DATASETS_BUCKET=datasets`
  - client keys equal server keys; no SSL/CA lines
- **Delete `utils/generate_minio_certs.bat` and `utils/generate_minio_certs.sh`**.

### 5. Documentation

- Update every remaining "MinIO" reference to RustFS/S3 across `README.md`, `CLAUDE.md`, and `documentation/**` (architecture overview, data-flow, dataset-processing pipeline/csv-parsing/file-splitting, error-handling/error-types, monorepo/workspace-structure, backend-api/service-layer + architecture-overview, and the `documentation/docker/prod/**` set).
- `THIRD_PARTY_LICENSES.txt` and `pnpm-lock.yaml` regenerate from the dependency swap via `make install-dev`.
- Leave `docs/superpowers/**` historical records untouched.

## Verification

- `make lint` and `make typecheck` pass.
- `make install-dev` regenerates the lockfile and third-party licenses cleanly.
- `grep -ri minio` across the repo returns **only** `docs/superpowers/**` historical files (and this spec) — proving no functional MinIO references remain.
- Optional smoke test: bring the stack up and confirm `GET /api/v1/health` reports storage healthy, and a dataset upload round-trips through RustFS.

## Risks

- **RustFS healthcheck tooling**: the image may not bundle `curl`/`wget`. Mitigation: verify during implementation; fall back to an alternate health command if needed.
- **AWS SDK stream typing**: `GetObjectCommand` body is a platform-dependent stream; the Node runtime yields a `Readable`. `streamToBuffer` and `getObjectStream` must cast/adapt accordingly.
- **Region requirement**: AWS SDK mandates a region even though RustFS ignores it; defaulted to `us-east-1`.
