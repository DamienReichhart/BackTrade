# =============================================================================
# Stage 1: Extract Nginx Runtime Dependencies
# =============================================================================
FROM nginx:1.29-alpine AS extractor

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

# Copy mime.types
RUN cp /etc/nginx/mime.types /runtime/etc/nginx/

# Create minimal passwd and group for non-root user (nginx user UID 101)
RUN echo "nginx:x:101:101:nginx:/nonexistent:/sbin/nologin" > /runtime/etc/passwd && \
    echo "nginx:x:101:" > /runtime/etc/group

# Set correct permissions
RUN chown -R 101:101 /runtime/var/cache/nginx /runtime/var/run /runtime/tmp
RUN chmod 1777 /runtime/tmp

# =============================================================================
# Stage 2: Final Distroless Image (from scratch)
# =============================================================================
FROM scratch

# Labels for image metadata
LABEL org.opencontainers.image.title="BackTrade Proxy" \
      org.opencontainers.image.description="Distroless production image for BackTrade Reverse Proxy" \
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
COPY docker/config/proxy/nginx.conf /etc/nginx/nginx.conf

# Use non-root nginx user
USER 101:101

# Expose port
EXPOSE 8080

# Stopsignal for graceful shutdown
STOPSIGNAL SIGQUIT

# Entry point - nginx in foreground mode
ENTRYPOINT ["/usr/sbin/nginx"]
CMD ["-g", "daemon off;"]
