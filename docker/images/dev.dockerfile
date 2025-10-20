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

# Install dependencies
RUN pnpm install --frozen-lockfile

# Ensure turbo and other binaries are available in PATH
ENV PATH="/app/node_modules/.bin:$PATH"

CMD ["pnpm", "dev"]
