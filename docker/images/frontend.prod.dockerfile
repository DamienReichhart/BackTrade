# =============================================================================
# Stage 1: Build Application
# =============================================================================
FROM node:25-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency manifests first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

# Install all dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm build

# =============================================================================
# Stage 2: Extract Nginx Runtime Dependencies
# =============================================================================
FROM nginx:1.27-alpine AS extractor

# Install tools for dependency analysis
RUN apk add --no-cache binutils

# Create directory structure for scratch image
RUN mkdir -p /runtime/lib \
             /runtime/usr/sbin \
             /runtime/etc/nginx \
             /runtime/var/cache/nginx/client_temp \
             /runtime/var/cache/nginx/proxy_temp \
             /runtime/var/cache/nginx/fastcgi_temp \
             /runtime/var/cache/nginx/uwsgi_temp \
             /runtime/var/cache/nginx/scgi_temp \
             /runtime/var/run \
             /runtime/usr/share/nginx/html \
             /runtime/tmp

# Copy nginx binary
RUN cp /usr/sbin/nginx /runtime/usr/sbin/

# Extract all shared library dependencies
RUN ldd /usr/sbin/nginx | grep "=>" | awk '{print $3}' | xargs -I {} cp -L {} /runtime/lib/ 2>/dev/null || true
RUN cp -L /lib/ld-musl-*.so.1 /runtime/lib/ 2>/dev/null || true

# Copy additional required libraries
RUN for lib in /lib/libz.so* /lib/libssl.so* /lib/libcrypto.so* /usr/lib/libpcre2-8.so*; do \
        [ -e "$lib" ] && cp -L "$lib" /runtime/lib/ 2>/dev/null || true; \
    done

# Copy mime.types (essential for serving web content)
RUN cp /etc/nginx/mime.types /runtime/etc/nginx/

# Create minimal passwd and group for non-root user (nginx user UID 101)
RUN echo "nginx:x:101:101:nginx:/nonexistent:/sbin/nologin" > /runtime/etc/passwd && \
    echo "nginx:x:101:" > /runtime/etc/group

# Set correct permissions
RUN chown -R 101:101 /runtime/var/cache/nginx /runtime/var/run /runtime/tmp
RUN chmod 1777 /runtime/tmp

# =============================================================================
# Stage 3: Final Distroless Image (from scratch)
# =============================================================================
FROM scratch

# Labels for image metadata
LABEL org.opencontainers.image.title="BackTrade Frontend" \
      org.opencontainers.image.description="Distroless production image for BackTrade Frontend" \
      org.opencontainers.image.vendor="BackTrade"

# Copy runtime filesystem from extractor
COPY --from=extractor /runtime/lib /lib
COPY --from=extractor /runtime/usr/sbin/nginx /usr/sbin/nginx
COPY --from=extractor /runtime/etc/nginx/mime.types /etc/nginx/mime.types
COPY --from=extractor /runtime/etc/passwd /etc/passwd
COPY --from=extractor /runtime/etc/group /etc/group
COPY --from=extractor /runtime/tmp /tmp

# Copy cache directories with correct ownership
COPY --from=extractor --chown=101:101 /runtime/var/cache/nginx /var/cache/nginx
COPY --from=extractor --chown=101:101 /runtime/var/run /var/run

# Copy nginx configuration (distroless version)
COPY docker/config/frontend/nginx.conf /etc/nginx/nginx.conf

# Copy built static assets
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Use non-root nginx user
USER 101:101

# Stopsignal for graceful shutdown
STOPSIGNAL SIGQUIT

# Entry point - nginx in foreground mode
ENTRYPOINT ["/usr/sbin/nginx"]
CMD ["-g", "daemon off;"]
