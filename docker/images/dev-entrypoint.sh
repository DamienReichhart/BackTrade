#!/bin/sh
set -e

# Install dependencies if node_modules doesn't exist or package files changed
if [ ! -d "/app/node_modules" ] || [ "package.json" -nt "/app/node_modules/.pnpm-install-timestamp" ] 2>/dev/null; then
  echo "Installing dependencies..."
  pnpm install --frozen-lockfile
  touch /app/node_modules/.pnpm-install-timestamp
fi

# Execute the command
exec "$@"

