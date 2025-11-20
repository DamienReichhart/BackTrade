# Overview

```plaintext

/apps
  /web              # React app
  /api              # Express app
/packages
  /types            # zod schemas + inferred types used by both sides
  /config           # env loader with zod
  /tsconfig         # base tsconfig
  /utils            # Utils func
/docker
  /config           # Config files for containers
  /datas            # Local containers volumes
  /images           # Dockerfiles

```

# API Structure

```plaintext

src/
  app.ts            # createExpressApp(): middlewares, routes, error handler
  server.ts         # boot (reads env, starts HTTP)
  routes/           # route -> controller mapping
  controllers/      # request/response only, no business logic
  services/         # business rules
  repositories/     # DB calls via Prisma
  middleware/       # auth, validation, rate limit
  schemas/          # zod schemas (imported from @backtrade/types when shared)
  libs/             # pino, prisma, redis, queue, mail


```

# Frontend Structure

```plaintext

src/
  main.tsx          # Application Entrypoint
  app/              # Base application need (ex: App.tsx, routing, etc...)
  config/           # Application configuration
  assets/
  features/         # All application features
    users/...
    auth/...
  components/       # Shared components
  hooks/            # Shared Hooks
  lib/              # Lib use
  types/            # Type definition (imported from @backtrade/types when shared)
  utils/

```
