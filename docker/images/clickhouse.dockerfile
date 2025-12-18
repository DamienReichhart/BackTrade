FROM clickhouse/clickhouse-server:latest

# Create data and logs directories
RUN mkdir -p /var/lib/clickhouse /var/log/clickhouse-server

# Set proper permissions
RUN chown -R clickhouse:clickhouse /var/lib/clickhouse /var/log/clickhouse-server

USER clickhouse