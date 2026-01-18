FROM postgres:18-alpine

# Create data directory
RUN mkdir -p /var/lib/postgresql/data

# Set proper permissions
RUN chown -R postgres:postgres /var/lib/postgresql/data