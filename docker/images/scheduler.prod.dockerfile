FROM node:25-alpine as builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN pnpm install --frozen-lockfile

RUN cd packages/datas && pnpm prisma:generate

RUN pnpm build

FROM node:25-alpine

# Install pnpm
RUN npm install -g pnpm

# Create a non-root user
RUN addgroup -g 1001 -S nodeuser && \
    adduser -S -u 1001 nodeuser -G nodeuser

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy workspace packages (including generated Prisma client)
COPY --from=builder /app/packages/ ./packages/

# Copy the built scheduler
COPY --from=builder /app/apps/scheduler/dist ./apps/scheduler/dist
COPY --from=builder /app/apps/scheduler/package.json ./apps/scheduler/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Change ownership of the app directory to the non-root user
RUN chown -R nodeuser:nodeuser /app

# Switch to non-root user
USER nodeuser

# Set working directory to the scheduler
WORKDIR /app/apps/scheduler
CMD ["node", "dist/scheduler.js"]
