# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

BackTrade is a deterministic multi-session historical trading simulator. Users replay past market data through a candlestick UI and execute trades against it as if live. Stripe handles tiered subscriptions; ClickHouse stores time-series candles; PostgreSQL stores everything else.

## Working environment — all dev runs inside Docker

The toolchain (pnpm, prisma, tsc, eslint, jest) runs **inside the `dev` container**, not on the host. Don't run `pnpm`, `prisma`, or `node` directly on the host for app commands — go through the Makefile or `docker compose -f docker-dev.yaml exec dev …`.

The `dev` container bind-mounts `apps/`, `packages/`, and `assets/`, but `node_modules` are anonymous volumes (host vs. container `node_modules` would clash on native deps like argon2/bcrypt). After adding a dep, run `make install-dev`, not `pnpm install` on the host.

Services in the docker-dev network use **static IPs on `192.168.250.0/24`** (see [.env.example](.env.example)) — `DATABASE_URL`, `REDIS_HOST`, etc. point at those IPs, not service names. Anything talking to Postgres/Redis/MinIO/ClickHouse/RabbitMQ from inside the container goes through these IPs.

## Common commands

All via the Makefile — see `make help` for the full list.

```bash
# Lifecycle
make setup            # one-shot: install, build dev image, start, init DB
make dev              # start the dev stack (detached)
make dev-shell        # shell into the dev container (run pnpm/prisma here)
make dev-logs         # follow logs across all services
make dev-down         # stop + remove containers

# Database (Prisma, runs inside the dev container)
make db-init          # generate + deploy + seed (first-time setup)
make db-migrate       # prisma migrate dev (create a new migration)
make db-generate      # regenerate Prisma client after schema edits
make db-studio        # open Prisma Studio

# Stripe webhook forwarding (host-side; requires stripe CLI + `stripe login`)
make stripe-listen    # forwards to http://localhost:21799/api/v1/stripe/webhook

# Quality (Turbo-orchestrated across the monorepo)
make lint             # eslint
make typecheck        # tsc --noEmit per package
make format           # prettier --write
make test             # jest across packages
make quality          # lint + typecheck + format-check
```

Targeting a single workspace (run from inside `make dev-shell` or prefix with `docker compose -f docker-dev.yaml exec dev`):

```bash
pnpm --filter @backtrade/api <script>     # backend
pnpm --filter @backtrade/web <script>     # frontend
pnpm --filter @backtrade/data <script>    # prisma/data layer
```

Run a single Jest test file: `pnpm --filter @backtrade/api test -- path/to/file.test.ts` (jest pattern after `--`).

Endpoints once `make dev` is up: frontend `http://localhost:5173`, API `http://localhost:21799` (base path `/api/v1`), health `http://localhost:21799/api/v1/health`, RabbitMQ UI `http://localhost:15672`, MinIO console `http://localhost:9001`.

## Architecture

**Monorepo**: pnpm workspaces + Turbo. `apps/` holds runnable services; `packages/` holds shared libraries.

### Services (apps/)

- **`api`** — Express + Zod-validated REST under `/api/v1`. The HTTP-facing service.
- **`worker`** — RabbitMQ consumer for async jobs (dataset processing, etc.). No HTTP.
- **`scheduler`** — Cron-driven service. Its main job is the **queue retry loop** (`QUEUE_RETRY_*` env vars): scans for failed jobs and re-enqueues with exponential backoff.
- **`web`** — React 18 + Vite + React Router + React Query + Zustand. Charts via lightweight-charts.

### Shared packages (packages/)

- **`@backtrade/data`** — **data access only**. Prisma schema, generated client, repositories (pure CRUD/queries/transactions), ClickHouse client, DB enums. **No business logic, no HTTP, no queue, no auth, no side effects.** Business rules live in `apps/api/src/services/`.
- **`@backtrade/types`** — Zod schemas + inferred TS types shared between frontend and backend. When you add an endpoint, define its request/response schemas here so `useFetch` on the frontend and the route handler on the backend validate against the same source.
- **`@backtrade/utils`** — pure helpers (no I/O).
- **`@backtrade/cache`** (Redis/ioredis), **`@backtrade/queue`** (RabbitMQ), **`@backtrade/storage`** (MinIO/S3-compatible), **`@backtrade/mailer`** (SMTP), **`@backtrade/logger`** (Pino) — each is the single integration point for its concern. Don't `new Redis()` or `amqplib.connect()` directly in app code.
- **`@backtrade/eslint-config`**, **`@backtrade/tsconfig`** — shared configs.

### Cross-cutting flows

- **Auth**: JWT access + refresh tokens (`ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET`), Argon2 password hashing. Role-based tiers: User / Trader / Expert / Admin.
- **Stripe webhooks**: `POST /api/v1/stripe/webhook` is **signature-verified against `STRIPE_WEBHOOK_SECRET`** and **persisted to a `stripe_event` table by `event.id` before processing** (idempotency). Processing then upserts subscriptions by `stripe_subscription_id`, looking up plans by `stripe_price_id`. Full sequence diagram: [documentation/stripe/webhook-processing.md](documentation/stripe/webhook-processing.md). For local dev: `make stripe-listen` + paste the printed `whsec_…` into `.env`, then restart the API.
- **Queue retry**: Failed RabbitMQ jobs are not lost — the `scheduler` re-publishes them with backoff governed by `QUEUE_RETRY_INITIAL_BACKOFF_MS`, `QUEUE_RETRY_BACKOFF_MULTIPLIER`, `QUEUE_RETRY_MAX_RETRIES`, `QUEUE_RETRY_MAX_BACKOFF_MS`.

## Conventions

The full convention set is in [.cursor/rules/](.cursor/rules/) (kept as the source of truth — read the relevant file when working in that area). Highlights that matter across the codebase:

- **TypeScript strict mode, no `any`.** Interface names PascalCase.
- **Frontend API calls** go through `useGet`/`usePost`/etc. (built on `useFetch`) with **explicit Zod `inputSchema` and `outputSchema`** from `@backtrade/types`. Don't call `fetch` directly. Pattern: [.cursor/rules/api-patterns.mdc](.cursor/rules/api-patterns.mdc).
- **Frontend state**: Zustand for global (auth, current session), React Query for server state, custom hooks for feature state, `useState` only for trivial UI-local state. Components render; hooks own logic.
- **Components**: each in its own directory (`Name/Name.tsx` + `Name.module.css` + `index.tsx`), named export, CSS Modules via `styles.*` — never inline classNames as strings.
- **CSS uses design-token variables only** (`var(--color-…)`, `var(--spacing-…)`, etc.) defined in [apps/web/src/main.css](apps/web/src/main.css). No hardcoded hex/px. Full token list: [.cursor/rules/brand-guide.mdc](.cursor/rules/brand-guide.mdc).
- **Feature module layout** under `apps/web/src/features/<feature>/`: `components/`, `hooks/`, `utils/`, optional `config/`, `types/`. Hooks export through `hooks/index.ts`; utils through `utils/index.ts`.
- **`@backtrade/data` is firewalled** — if you find yourself reaching for a service, HTTP client, or env var inside `packages/datas/`, move it to `apps/api/src/services/` instead.

### Git commits

Conventional Commits are **enforced** by the pre-commit hook ([.pre-commit-config.yaml](.pre-commit-config.yaml)) — `<type>(<scope>): <subject>` with **type and scope both required**, subject lowercase, imperative, no trailing period. Allowed types and scopes: [documentation/git-commit-standards.md](documentation/git-commit-standards.md). Examples: `feat(api): add user authentication`, `fix(web): resolve chart rendering`, `chore(deps): bump express`.

## Useful documentation

- [documentation/api.md](documentation/api.md) — REST API reference
- [documentation/backend-api/](documentation/backend-api/) — service layer, middleware stack, architecture overview
- [documentation/db/](documentation/db/) — ER diagram, data dictionary
- [documentation/stripe/](documentation/stripe/) — checkout, portal, webhook flows
- [documentation/frontend/routing-structure.md](documentation/frontend/routing-structure.md)
- [documentation/error-handling/error-types.md](documentation/error-handling/error-types.md)
- [documentation/ci-cd/](documentation/ci-cd/) — CI/CD pipeline
