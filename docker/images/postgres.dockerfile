FROM postgres:17

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=backtrade

# Expose PostgreSQL port
EXPOSE 5432

# Create data directory
RUN mkdir -p /var/lib/postgresql/data

# Set proper permissions
RUN chown -R postgres:postgres /var/lib/postgresql/data