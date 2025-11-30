#!/bin/bash

# Build and Push Docker Images for BackTrade
# This script builds and pushes the Docker images needed for Kubernetes deployment

set -e

# Default values
REGISTRY=""
VERSION="latest"
BUILD_ONLY=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -r, --registry REGISTRY    Docker registry URL (required for push)"
            echo "  -v, --version VERSION      Image version tag (default: latest)"
            echo "  --build-only              Only build, don't push"
            echo "  -h, --help                Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: docker is not installed or not in PATH${NC}"
    exit 1
fi

# Check if registry is set when pushing
if [ "$BUILD_ONLY" = false ] && [ -z "$REGISTRY" ]; then
    echo -e "${RED}Error: Registry must be specified when pushing images${NC}"
    echo "Use -r or --registry option, or use --build-only to only build"
    exit 1
fi

echo -e "${GREEN}Building BackTrade Docker Images${NC}"
if [ -n "$REGISTRY" ]; then
    echo "Registry: $REGISTRY"
fi
echo "Version: $VERSION"
echo ""

# Get the project root directory (parent of k8s directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Build backend image
echo -e "${GREEN}Building backend image...${NC}"
BACKEND_IMAGE="backtrade-api"
if [ -n "$REGISTRY" ]; then
    BACKEND_IMAGE="$REGISTRY/backtrade-api"
fi

docker build -f docker/images/backend.prod.dockerfile -t "$BACKEND_IMAGE:$VERSION" .
if [ "$BUILD_ONLY" = false ]; then
    echo -e "${GREEN}Pushing backend image...${NC}"
    docker push "$BACKEND_IMAGE:$VERSION"
fi

# Build frontend image
echo ""
echo -e "${GREEN}Building frontend image...${NC}"
FRONTEND_IMAGE="backtrade-frontend"
if [ -n "$REGISTRY" ]; then
    FRONTEND_IMAGE="$REGISTRY/backtrade-frontend"
fi

docker build -f docker/images/frontend.prod.dockerfile -t "$FRONTEND_IMAGE:$VERSION" .
if [ "$BUILD_ONLY" = false ]; then
    echo -e "${GREEN}Pushing frontend image...${NC}"
    docker push "$FRONTEND_IMAGE:$VERSION"
fi

echo ""
echo -e "${GREEN}Build complete!${NC}"
echo ""
echo "Images:"
echo "  - $BACKEND_IMAGE:$VERSION"
echo "  - $FRONTEND_IMAGE:$VERSION"
echo ""
if [ "$BUILD_ONLY" = true ]; then
    echo "Images are built but not pushed."
    echo "To push, run: docker push $BACKEND_IMAGE:$VERSION && docker push $FRONTEND_IMAGE:$VERSION"
else
    echo "Images have been pushed to registry."
fi

