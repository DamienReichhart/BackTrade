FROM redis:8.4.0-alpine

# Create entrypoint script that properly substitutes environment variables
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'exec redis-server --requirepass "$REDIS_PASSWORD" --appendonly no --save ""' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

USER redis

ENTRYPOINT ["/entrypoint.sh"]
