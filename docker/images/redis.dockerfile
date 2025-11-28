FROM redis:8.4.0-alpine

EXPOSE 6379

# Security note: The official redis:8.4.0-alpine base image includes /usr/local/bin/docker-entrypoint.sh
# that checks if running as root and uses gosu to drop privileges to the redis user before executing
# redis-server. By replacing ENTRYPOINT, we bypass this privilege-drop logic, so we must explicitly
# set ownership and switch to the redis user to avoid running as root.
# Reference: https://github.com/docker-library/redis/blob/master/8.4/alpine/docker-entrypoint.sh
RUN echo '#!/bin/sh' > /usr/local/bin/redis-entrypoint.sh && \
    echo 'set -e' >> /usr/local/bin/redis-entrypoint.sh && \
    echo 'mkdir -p /usr/local/etc/redis' >> /usr/local/bin/redis-entrypoint.sh && \
    echo 'if [ -n "$REDIS_PASSWORD" ]; then' >> /usr/local/bin/redis-entrypoint.sh && \
    echo '  echo "requirepass $REDIS_PASSWORD" > /usr/local/etc/redis/redis.conf' >> /usr/local/bin/redis-entrypoint.sh && \
    echo 'else' >> /usr/local/bin/redis-entrypoint.sh && \
    echo '  echo "# No password set" > /usr/local/etc/redis/redis.conf' >> /usr/local/bin/redis-entrypoint.sh && \
    echo 'fi' >> /usr/local/bin/redis-entrypoint.sh && \
    echo 'exec redis-server /usr/local/etc/redis/redis.conf "$@"' >> /usr/local/bin/redis-entrypoint.sh && \
    chmod +x /usr/local/bin/redis-entrypoint.sh && \
    chown -R redis:redis /usr/local/etc/redis

USER redis

ENTRYPOINT ["/usr/local/bin/redis-entrypoint.sh"]

