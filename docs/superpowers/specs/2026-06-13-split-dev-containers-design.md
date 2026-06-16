# Design: Split the dev container into per-process containers

**Date:** 2026-06-13
**Status:** Approved (pending implementation plan)

## Problem

The development stack runs all four application processes — `api`, `web`,
`worker`, `scheduler` — inside a single `dev` container via
`pnpm dev` → `turbo run dev --parallel`. This couples their lifecycles:

- A crash or hang in one process is entangled with the others (shared container
  lifecycle, shared restart).
- Logs from all four are interleaved by turbo, making per-service inspection
  awkward.
- It diverges from production, where `backend` / `frontend` / `worker` /
  `scheduler` already run as separate services.

## Goals

- **Crash isolation** — one process crashing/hanging must not take down the
  others; each recovers independently.
- **Consistency** — dev topology should resemble prod (one container per
  process) and keep shared-package/Prisma behavior identical.

## Non-goals

- Changing the infra services (postgres, redis, minio, clickhouse, rabbitmq).
  They already run as isolated containers and are untouched.
- Introducing a shared dependency volume or init container (rejected — see
  Decisions).
- Running shared-package `tsc --watch` watchers in dev runtime (rejected — see
  Decisions).

## Decisions

| Decision            | Choice                                                                                            | Rationale                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Process topology    | 4 app containers + 1 tooling container                                                            | Crash isolation; mirrors prod                                                                                                          |
| Image               | Reuse existing `docker/images/dev.dockerfile` for all 5 services, override `command:` per service | DRY; no new dockerfiles                                                                                                                |
| Dependency strategy | Per-container `node_modules` (anonymous volumes), each runs `pnpm install` on entrypoint          | Full isolation; reuses today's entrypoint unchanged                                                                                    |
| Service names       | `api` / `web` / `worker` / `scheduler`                                                            | Match `apps/` folder names and pnpm filters                                                                                            |
| Tooling host        | Dedicated `tools` container running `sleep infinity`                                              | Keeps app containers single-purpose; hosts all Prisma/pnpm/db commands                                                                 |
| Package watchers    | Dropped in dev runtime                                                                            | Apps import package `src` directly (see Key Findings); watchers emit unused `dist`. Type-checking stays available via `make typecheck` |

## Key findings (verified against the codebase)

1. **Apps import package source, not `dist`.** Every shared package
   (`@backtrade/data`, `@backtrade/types`, `@backtrade/utils`, `logger`,
   `cache`, `queue`, `storage`, `mailer`) sets `main`/`exports` to
   `./src/index.ts` for all conditions (`types`/`import`/`require`). Apps run via
   `tsx`/`nodemon` (api/worker/scheduler) and `vite` (web), which consume the TS
   source directly. The packages' `tsc --watch` `dev` scripts only emit `dist`
   that nothing imports at dev runtime — so they are safe to drop per container.

2. **Prisma client output is in bind-mounted source.** The generator writes to
   `packages/datas/src/generated/prisma` (`output = "../src/generated/prisma"`),
   which lives under the bind-mounted `packages/` tree — **not** inside
   `node_modules`. Therefore `prisma generate` run from the `tools` container is
   immediately visible to all four app containers despite per-container
   `node_modules`.

3. **The entrypoint already does what each container needs.**
   `docker/scripts/dev-entrypoint.sh` runs `pnpm install --frozen-lockfile`
   (relinks workspaces against the mounted source) then `exec "$@"`. Overriding
   `command:` per service is sufficient — no entrypoint changes required.

## Architecture

Replace the single `dev` service with five services, all built from
`docker/images/dev.dockerfile`, differing only by `command:`.

| Service     | `command:`                               | Ports         | Static IP                  |
| ----------- | ---------------------------------------- | ------------- | -------------------------- |
| `api`       | `pnpm --filter @backtrade/api dev`       | `21799:21799` | 192.168.250.11 (unchanged) |
| `web`       | `pnpm --filter @backtrade/web dev`       | `5173:5173`   | 192.168.250.12             |
| `worker`    | `pnpm --filter @backtrade/worker dev`    | —             | 192.168.250.13             |
| `scheduler` | `pnpm --filter @backtrade/scheduler dev` | —             | 192.168.250.14             |
| `tools`     | `sleep infinity`                         | —             | 192.168.250.15             |

Each app/tools service:

- builds from `dev.dockerfile`,
- uses `env_file: .env`,
- bind-mounts `./apps`, `./packages`, `./assets`,
- carries the **same anonymous `node_modules` volume list** as today's `dev`
  service (root + every app + every package),
- sets `restart: always`,
- joins the `backtrade` network at its static IP.

Infra services and the network/volume definitions are unchanged.

## Data flow / behavior

- On `up`, all five containers run the entrypoint install concurrently, then
  start their command. `tools` idles on `sleep infinity`.
- Browser → `web` (`localhost:5173`) and browser → `api` (`localhost:21799`) via
  host port mappings, exactly as today. Web does not call the api server-side, so
  no app-to-app container link is required.
- Apps reach infra (postgres/redis/minio/clickhouse/rabbitmq) via the existing
  static IPs in `.env` — unchanged.
- `prisma generate` / migrations run in `tools` write to bind-mounted source,
  visible everywhere.

## Makefile & docs changes

- Replace `DEV_SERVICE := dev` with `TOOLS_SERVICE := tools`. Point all `db-*`
  targets and `dev-shell` at `tools`.
- Add per-service convenience targets:
    - `logs-api`, `logs-web`, `logs-worker`, `logs-scheduler`
    - `shell-api`, `shell-web`, `shell-worker`, `shell-scheduler` (and
      `dev-shell` → `tools`)
- `install-dev`: run `pnpm install` in each of the five app/tools containers
  (loop), since `node_modules` are per-container.
- `dev-logs` (follow all) still works unchanged across the multiple services.
- Update `CLAUDE.md`: replace
  `docker compose -f docker-dev.yaml exec dev …` references with `… exec tools …`,
  and note that `make dev-shell` now lands in `tools`.

## Trade-offs accepted

- First `make dev-build` runs `pnpm install` 5× in parallel: slower cold start
  and more disk than the single container. This is the cost of full isolation.
- A `pnpm-lock.yaml` change requires `make install-dev` to resync all
  containers.
- No live background type-checking from package watchers; use `make typecheck`
  on demand instead.

## Testing / acceptance

- `make dev-build` brings up `api`, `web`, `worker`, `scheduler`, `tools` plus
  infra; all reach steady state.
- `http://localhost:21799/api/v1/health` returns healthy; `http://localhost:5173`
  serves the frontend.
- `docker compose -f docker-dev.yaml logs -f worker` shows only worker output.
- Killing the `worker` container leaves `api`/`web`/`scheduler` running; it
  restarts on its own.
- `make db-init` / `make db-studio` run successfully against the `tools`
  container; generated Prisma client is picked up by `api` without a rebuild.
- `make dev-shell` opens a shell in `tools`.
