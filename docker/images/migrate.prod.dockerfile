# =============================================================================
# Migration Service Dockerfile
# =============================================================================
# This Dockerfile creates a container specifically for running database
# migrations and seeding. It includes Prisma CLI and all necessary dependencies
# to execute both PostgreSQL (Prisma) and ClickHouse migrations, as well as
# database seeding operations.
# =============================================================================

FROM node:25-alpine as builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files for dependency resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy packages directory (needed for workspace dependencies)
COPY packages/ ./packages/

# Copy apps directory (needed for seed scripts)
COPY apps/ ./apps/

# Install all dependencies (including dev dependencies for Prisma CLI)
RUN pnpm install --frozen-lockfile

# Generate Prisma client (required for migrations)
RUN cd packages/datas && pnpm prisma:generate

FROM node:25-alpine

# Install pnpm
RUN npm install -g pnpm

# Create a non-root user
RUN addgroup -g 1001 -S nodeuser && \
    adduser -S -u 1001 nodeuser -G nodeuser

WORKDIR /app

# Copy package files and workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy the datas package with all migrations, schema, and scripts
COPY --from=builder /app/packages/datas ./packages/datas

# Copy all workspace packages needed for migrations and seeding
# The API seed script depends on multiple workspace packages
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/packages/tsconfig ./packages/tsconfig
COPY --from=builder /app/packages/logger ./packages/logger
COPY --from=builder /app/packages/utils ./packages/utils
COPY --from=builder /app/packages/cache ./packages/cache
COPY --from=builder /app/packages/mailer ./packages/mailer
COPY --from=builder /app/packages/queue ./packages/queue
COPY --from=builder /app/packages/storage ./packages/storage

# Copy API package seed files and source code (needed for database seeding)
# The seed script imports from src/services, so we need the full src directory
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/src ./apps/api/src
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Copy node_modules from builder (includes Prisma CLI, tsx, and all dependencies)
# This ensures all dev dependencies needed for migrations are available
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/datas/node_modules ./packages/datas/node_modules
COPY --from=builder /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=builder /app/packages/logger/node_modules ./packages/logger/node_modules
COPY --from=builder /app/packages/utils/node_modules ./packages/utils/node_modules
COPY --from=builder /app/packages/cache/node_modules ./packages/cache/node_modules
COPY --from=builder /app/packages/mailer/node_modules ./packages/mailer/node_modules
COPY --from=builder /app/packages/queue/node_modules ./packages/queue/node_modules
COPY --from=builder /app/packages/storage/node_modules ./packages/storage/node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Change ownership of the app directory to the non-root user
RUN chown -R nodeuser:nodeuser /app

# Switch to non-root user
USER nodeuser

# Set working directory to the datas package
WORKDIR /app/packages/datas

# Default command: run migrations and seed
# This will be overridden in docker-compose if needed
CMD ["sh", "-c", "pnpm prisma:deploy && pnpm prisma:seed"]
