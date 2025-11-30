FROM postgres:18-alpine

# Expose PostgreSQL port
EXPOSE 5432

# Create data directory
RUN mkdir -p /var/lib/postgresql/data

# Set proper permissions
RUN chown -R postgres:postgres /var/lib/postgresql/data