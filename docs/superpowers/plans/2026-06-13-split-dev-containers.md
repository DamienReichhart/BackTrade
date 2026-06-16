# Split Dev Container Per Process — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single dev `dev` container (which runs all four app processes via `turbo run dev --parallel`) with four per-process containers (`api`, `web`, `worker`, `scheduler`) plus one `tools` container, for crash isolation and prod-like consistency.

**Architecture:** All five services build from the existing `docker/images/dev.dockerfile` image and differ only by `command:`. The existing entrypoint (`pnpm install --frozen-lockfile` then `exec "$@"`) is reused unchanged. Each service keeps the current per-container anonymous `node_modules` volumes. A YAML anchor holds the shared base config to stay DRY. The `tools` container idles on `sleep infinity` and hosts all Prisma/pnpm/db commands.

**Tech Stack:** Docker Compose, pnpm workspaces, Turbo, GNU Make.

> **Note on testing:** This is infrastructure/config work with no unit-test harness. "Tests" here are operational verifications run with `docker compose` / `make` and `curl`. Each task ends by verifying behavior and committing.

> **Reference:** Spec at `docs/superpowers/specs/2026-06-13-split-dev-containers-design.md`.

---

## File Structure

- `docker-dev.yaml` — replace the single `dev` service with a `x-dev-base` anchor + five services (`api`, `web`, `worker`, `scheduler`, `tools`). Infra services, volumes, and network unchanged.
- `Makefile` — retarget tooling/db commands from `dev` to a new `tools` service; add per-service `logs-*`/`shell-*` targets; make `install-dev` loop over all app/tools containers.
- `CLAUDE.md` — update the four references that name the `dev` container so they point at `tools`.

---

## Task 1: Replace the `dev` service with five per-process services in `docker-dev.yaml`

**Files:**

- Modify: `docker-dev.yaml:1-34` (the `services:` header and the entire `dev:` service block)

- [ ] **Step 1: Verify the current `dev` block is exactly what we expect**

Run:

```bash
sed -n '1,34p' docker-dev.yaml
```

Expected: lines 1-34 show `services:` followed by the `dev:` service ending at `restart: always` (line 34), immediately before the `postgres:` service on line 36.

- [ ] **Step 2: Replace the `services:` header + `dev:` block with the anchor and five services**

Replace this exact text (lines 1-34):

```yaml
services:
    dev:
        build:
            context: .
            dockerfile: ./docker/images/dev.dockerfile
        env_file:
            - .env
        ports:
            - "21799:21799"
            - "5173:5173"
        volumes:
            - ./apps:/app/apps
            - ./packages:/app/packages
            - ./assets:/app/assets
            # Exclude node_modules from volume mounts to preserve installed dependencies
            - /app/node_modules
            - /app/apps/api/node_modules
            - /app/apps/worker/node_modules
            - /app/apps/web/node_modules
            - /app/apps/scheduler/node_modules
            - /app/packages/datas/node_modules
            - /app/packages/logger/node_modules
            - /app/packages/cache/node_modules
            - /app/packages/queue/node_modules
            - /app/packages/storage/node_modules
            - /app/packages/mailer/node_modules
            - /app/packages/eslint-config/node_modules
            - /app/packages/tsconfig/node_modules
            - /app/packages/types/node_modules
            - /app/packages/utils/node_modules
        networks:
            backtrade:
                ipv4_address: 192.168.250.11
        restart: always
```

with:

```yaml
# Shared base for every dev app/tools container. Each service overrides
# `command:`. Anonymous node_modules volumes are per-container (isolation);
# the entrypoint runs `pnpm install --frozen-lockfile` then execs `command`.
x-dev-base: &dev-base
    build:
        context: .
        dockerfile: ./docker/images/dev.dockerfile
    env_file:
        - .env
    volumes:
        - ./apps:/app/apps
        - ./packages:/app/packages
        - ./assets:/app/assets
        # Exclude node_modules from volume mounts to preserve installed dependencies
        - /app/node_modules
        - /app/apps/api/node_modules
        - /app/apps/worker/node_modules
        - /app/apps/web/node_modules
        - /app/apps/scheduler/node_modules
        - /app/packages/datas/node_modules
        - /app/packages/logger/node_modules
        - /app/packages/cache/node_modules
        - /app/packages/queue/node_modules
        - /app/packages/storage/node_modules
        - /app/packages/mailer/node_modules
        - /app/packages/eslint-config/node_modules
        - /app/packages/tsconfig/node_modules
        - /app/packages/types/node_modules
        - /app/packages/utils/node_modules
    restart: always

services:
    api:
        <<: *dev-base
        command: ["pnpm", "--filter", "@backtrade/api", "dev"]
        ports:
            - "21799:21799"
        networks:
            backtrade:
                ipv4_address: 192.168.250.11

    web:
        <<: *dev-base
        command: ["pnpm", "--filter", "@backtrade/web", "dev"]
        ports:
            - "5173:5173"
        networks:
            backtrade:
                ipv4_address: 192.168.250.12

    worker:
        <<: *dev-base
        command: ["pnpm", "--filter", "@backtrade/worker", "dev"]
        networks:
            backtrade:
                ipv4_address: 192.168.250.13

    scheduler:
        <<: *dev-base
        command: ["pnpm", "--filter", "@backtrade/scheduler", "dev"]
        networks:
            backtrade:
                ipv4_address: 192.168.250.14

    tools:
        <<: *dev-base
        command: ["sleep", "infinity"]
        networks:
            backtrade:
                ipv4_address: 192.168.250.15
```

- [ ] **Step 3: Validate the compose file parses and shows the five new services**

Run:

```bash
docker compose -f docker-dev.yaml config --services | sort
```

Expected output (alphabetical): `api`, `clickhouse`, `minio`, `postgres`, `rabbitmq`, `redis`, `scheduler`, `tools`, `web`, `worker`. No `dev`. No YAML/anchor errors.

- [ ] **Step 4: Confirm each app service resolved the anchor (volumes + build)**

Run:

```bash
docker compose -f docker-dev.yaml config | grep -A2 'image:\|context:' | head; \
docker compose -f docker-dev.yaml config | grep -c '/app/apps/api/node_modules'
```

Expected: the second command prints `5` (the anonymous node_modules entry appears once per app/tools service, proving the anchor merged into all five).

- [ ] **Step 5: Commit**

```bash
git add docker-dev.yaml
git commit -m "feat(docker): split dev container into per-process services"
```

---

## Task 2: Retarget Makefile tooling/db commands and add per-service helpers

**Files:**

- Modify: `Makefile:7` (the `DEV_SERVICE` variable)
- Modify: `Makefile:47-49` (`dev-shell` target)
- Modify: `Makefile:93-126` (all `db-*` targets)
- Modify: `Makefile:149-152` (`install-dev` target)
- Modify: `Makefile:43-45` (add new per-service log/shell targets after `dev-logs`)

- [ ] **Step 1: Rename the service variable**

Replace (line 7):

```makefile
DEV_SERVICE := dev
```

with:

```makefile
TOOLS_SERVICE := tools
```

- [ ] **Step 2: Point `dev-shell` and all `db-*`/`install-dev` execs at `tools`**

Run a single safe replacement of every `$(DEV_SERVICE)` reference to `$(TOOLS_SERVICE)`:

```bash
sed -i 's/\$(DEV_SERVICE)/$(TOOLS_SERVICE)/g' Makefile
```

Expected: the targets `dev-shell`, `db-init`, `db-generate`, `db-migrate`, `db-deploy`, `db-seed`, `db-studio`, `db-reset`, and `install-dev` now reference `$(TOOLS_SERVICE)`.

- [ ] **Step 3: Verify no stale `$(DEV_SERVICE)` remains**

Run:

```bash
grep -n 'DEV_SERVICE' Makefile
```

Expected: no output (zero matches).

- [ ] **Step 4: Update the `dev-shell` help text to say `tools`**

Replace (the `dev-shell` target, originally lines 47-49):

```makefile
.PHONY: dev-shell
dev-shell: ## Open shell in development container
	$(DOCKER_COMPOSE_DEV) exec $(TOOLS_SERVICE) /bin/sh
```

with:

```makefile
.PHONY: dev-shell
dev-shell: ## Open shell in the tools container (run pnpm/prisma here)
	$(DOCKER_COMPOSE_DEV) exec $(TOOLS_SERVICE) /bin/sh
```

- [ ] **Step 5: Add per-service logs/shell targets after `dev-logs`**

After the `dev-logs` target (originally lines 43-45), insert:

```makefile
.PHONY: logs-api logs-web logs-worker logs-scheduler
logs-api: ## Follow logs for the api service
	$(DOCKER_COMPOSE_DEV) logs -f api
logs-web: ## Follow logs for the web service
	$(DOCKER_COMPOSE_DEV) logs -f web
logs-worker: ## Follow logs for the worker service
	$(DOCKER_COMPOSE_DEV) logs -f worker
logs-scheduler: ## Follow logs for the scheduler service
	$(DOCKER_COMPOSE_DEV) logs -f scheduler

.PHONY: shell-api shell-web shell-worker shell-scheduler
shell-api: ## Open a shell in the api service
	$(DOCKER_COMPOSE_DEV) exec api /bin/sh
shell-web: ## Open a shell in the web service
	$(DOCKER_COMPOSE_DEV) exec web /bin/sh
shell-worker: ## Open a shell in the worker service
	$(DOCKER_COMPOSE_DEV) exec worker /bin/sh
shell-scheduler: ## Open a shell in the scheduler service
	$(DOCKER_COMPOSE_DEV) exec scheduler /bin/sh
```

- [ ] **Step 6: Make `install-dev` install across all five containers**

Replace the `install-dev` target (originally lines 149-152, now with `$(TOOLS_SERVICE)`):

```makefile
.PHONY: install-dev
install-dev: dev ## Install dependencies and start dev environment
	@echo "Installing dependencies and starting dev environment..."
	$(DOCKER_COMPOSE_DEV) exec $(TOOLS_SERVICE) $(PNPM) install
```

with:

```makefile
.PHONY: install-dev
install-dev: dev ## Install dependencies in every dev container (per-container node_modules)
	@echo "Installing dependencies across dev containers..."
	@for svc in api web worker scheduler tools; do \
		echo "  -> $$svc"; \
		$(DOCKER_COMPOSE_DEV) exec $$svc $(PNPM) install; \
	done
```

- [ ] **Step 7: Verify the Makefile parses and new targets appear in help**

Run:

```bash
make help | grep -E 'logs-(api|worker)|shell-api|dev-shell|install-dev'
```

Expected: lines for `logs-api`, `logs-worker`, `shell-api`, `dev-shell`, and `install-dev` are listed with their help text. No `make` parse errors.

- [ ] **Step 8: Commit**

```bash
git add Makefile
git commit -m "feat(docker): point make tooling at tools container, add per-service targets"
```

---

## Task 3: Update `CLAUDE.md` references to the `dev` container

**Files:**

- Modify: `CLAUDE.md:11`, `CLAUDE.md:25`, `CLAUDE.md:29`, `CLAUDE.md:46`

- [ ] **Step 1: Update the toolchain sentence (line 11)**

Replace:

```
The toolchain (pnpm, prisma, tsc, eslint, jest) runs **inside the `dev` container**, not on the host. Don't run `pnpm`, `prisma`, or `node` directly on the host for app commands — go through the Makefile or `docker compose -f docker-dev.yaml exec dev …`.
```

with:

```
The toolchain (pnpm, prisma, tsc, eslint, jest) runs **inside the `tools` container**, not on the host. Each app process (`api`, `web`, `worker`, `scheduler`) runs in its own container; the `tools` container is a dedicated shell for pnpm/prisma/db work. Don't run `pnpm`, `prisma`, or `node` directly on the host for app commands — go through the Makefile or `docker compose -f docker-dev.yaml exec tools …`.
```

- [ ] **Step 2: Update the `make dev-shell` comment (line 25)**

Replace:

```
make dev-shell        # shell into the dev container (run pnpm/prisma here)
```

with:

```
make dev-shell        # shell into the tools container (run pnpm/prisma here)
```

- [ ] **Step 3: Update the Database section comment (line 29)**

Replace:

```
# Database (Prisma, runs inside the dev container)
```

with:

```
# Database (Prisma, runs inside the tools container)
```

- [ ] **Step 4: Update the single-workspace targeting note (line 46)**

Replace:

```
Targeting a single workspace (run from inside `make dev-shell` or prefix with `docker compose -f docker-dev.yaml exec dev`):
```

with:

```
Targeting a single workspace (run from inside `make dev-shell` or prefix with `docker compose -f docker-dev.yaml exec tools`):
```

- [ ] **Step 5: Verify no stale `exec dev` / "dev container" references remain**

Run:

```bash
grep -n "exec dev\b\|the \`dev\` container\|into the dev container\|inside the \`dev\` container" CLAUDE.md
```

Expected: no output (zero matches).

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(docker): update CLAUDE.md to reference tools container"
```

---

## Task 4: Operational verification of the full split stack

**Files:** none (verification only)

- [ ] **Step 1: Build and start the new stack**

Run:

```bash
make dev-build
```

Expected: compose builds (or reuses) the dev image and starts `api`, `web`, `worker`, `scheduler`, `tools`, plus the five infra services, with no errors.

- [ ] **Step 2: Confirm all five app/tools containers are up**

Run:

```bash
docker compose -f docker-dev.yaml ps --format '{{.Service}}\t{{.State}}' | sort
```

Expected: `api`, `web`, `worker`, `scheduler`, `tools` each show `running` (alongside the infra services).

- [ ] **Step 3: Initialize the database from the tools container**

Run:

```bash
make db-init
```

Expected: Prisma generate + migrate deploy + seed complete successfully, executing inside the `tools` container.

- [ ] **Step 4: Verify the API is healthy and the frontend serves**

Run:

```bash
curl -fsS http://localhost:21799/api/v1/health && echo OK; \
curl -fsS -o /dev/null -w '%{http_code}\n' http://localhost:5173
```

Expected: health endpoint returns a success body then `OK`; the web request prints `200`.

- [ ] **Step 5: Verify per-service logs are isolated**

Run:

```bash
docker compose -f docker-dev.yaml logs --tail=20 worker
```

Expected: output contains only worker process output — no api/web/scheduler log lines interleaved.

- [ ] **Step 6: Verify crash isolation**

Run:

```bash
docker compose -f docker-dev.yaml kill worker; sleep 2; \
docker compose -f docker-dev.yaml ps --format '{{.Service}}\t{{.State}}' | grep -E 'api|web|scheduler'
```

Expected: `api`, `web`, and `scheduler` remain `running` after `worker` is killed. (With `restart: always`, `worker` will also come back on its own shortly.)

- [ ] **Step 7: Verify `make dev-shell` lands in the tools container**

Run:

```bash
echo 'pwd; pnpm --version' | docker compose -f docker-dev.yaml exec -T tools /bin/sh
```

Expected: prints `/app` and a pnpm version — confirming the tools container has the workspace mounted and pnpm available.

- [ ] **Step 8: Final commit (if any verification surfaced a fix)**

If steps 1-7 all pass with no changes needed, there is nothing to commit here. If a fix was required, commit it:

```bash
git add -A
git commit -m "fix(docker): correct dev split issue found in verification"
```

---

## Self-Review Notes

- **Spec coverage:** topology (Task 1), image reuse + per-container node_modules (Task 1 anchor), service names (Task 1), tools container (Task 1 + Task 2), Makefile retarget + per-service targets + install-dev loop (Task 2), CLAUDE.md updates (Task 3), trade-offs/acceptance criteria (Task 4 verification) — all covered.
- **Dropped package watchers:** intentionally not run per container (apps import package `src`); no task adds them. `make typecheck` remains the type-checking path and is unchanged.
- **IP assignments:** `.11`–`.15` verified clear of infra IPs (`.21/.22/.23/.24/.31`) in `.env`.
