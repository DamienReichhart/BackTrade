FROM node:25-alpine as builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN pnpm install --frozen-lockfile

RUN pnpm build

FROM node:25-alpine

ENV NODE_ENV=production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy workspace packages
COPY packages/ ./packages/

# Copy the built API
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Set working directory to the API
WORKDIR /app/apps/api

CMD ["node", "dist/server.bundle.js"]