FROM redis:8.4.0-alpine

ENV REDIS_PASSWORD=password
EXPOSE 6379

# Set the password for Redis
RUN mkdir -p /usr/local/etc/redis
RUN echo "requirepass ${REDIS_PASSWORD}" >> /usr/local/etc/redis/redis.conf

# Set the entrypoint to run Redis with the custom config
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]

