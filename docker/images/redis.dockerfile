FROM redis:8.4.0-alpine

EXPOSE 6379

RUN mkdir -p /usr/local/etc/redis && \
    chown -R redis:redis /usr/local/etc/redis && \
    echo '#!/bin/sh' > /usr/local/bin/redis-entrypoint.sh && \
    echo 'set -e' >> /usr/local/bin/redis-entrypoint.sh && \
    echo 'mkdir -p /usr/local/etc/redis' >> /usr/local/bin/redis-entrypoint.sh && \
    echo 'if [ -n "$REDIS_PASSWORD" ]; then' >> /usr/local/bin/redis-entrypoint.sh && \
    echo '  echo "requirepass $REDIS_PASSWORD" > /usr/local/etc/redis/redis.conf' >> /usr/local/bin/redis-entrypoint.sh && \
    echo 'else' >> /usr/local/bin/redis-entrypoint.sh && \
    echo '  echo "# No password set" > /usr/local/etc/redis/redis.conf' >> /usr/local/bin/redis-entrypoint.sh && \
    echo 'fi' >> /usr/local/bin/redis-entrypoint.sh && \
    echo 'exec redis-server /usr/local/etc/redis/redis.conf "$@"' >> /usr/local/bin/redis-entrypoint.sh && \
    chmod +x /usr/local/bin/redis-entrypoint.sh

USER redis

ENTRYPOINT ["/usr/local/bin/redis-entrypoint.sh"]

