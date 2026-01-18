FROM node:25-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Set CI environment variable to prevent pnpm TTY issues
ENV CI=true

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

# Copy entrypoint script and ensure Unix line endings
COPY docker/scripts/dev-entrypoint.sh /tmp/dev-entrypoint.sh
RUN tr -d '\r' < /tmp/dev-entrypoint.sh > /usr/local/bin/dev-entrypoint.sh && \
    chmod +x /usr/local/bin/dev-entrypoint.sh && \
    rm /tmp/dev-entrypoint.sh

# Install dependencies (will be relinked by entrypoint after volumes mount)
RUN pnpm install --frozen-lockfile

# Ensure turbo and other binaries are available in PATH
ENV PATH="/app/node_modules/.bin:$PATH"

ENTRYPOINT ["/usr/local/bin/dev-entrypoint.sh"]
CMD ["pnpm", "dev"]
