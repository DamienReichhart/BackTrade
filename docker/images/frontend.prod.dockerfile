FROM node:24-alpine as builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN pnpm install --frozen-lockfile

RUN pnpm build

FROM nginx:alpine

COPY docker/config/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80