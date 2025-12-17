#!/bin/sh
set -e

# Relink workspace packages after volumes are mounted
# This ensures that pnpm workspace symlinks work correctly
# when source directories are mounted as volumes
# Using --prefer-offline to speed up by using cached packages when possible
echo "Relinking workspace packages after volume mount..."
pnpm install --frozen-lockfile

# Execute the original command
exec "$@"
