#!/bin/bash

# BackTrade Kubernetes Deployment Script
# This script helps deploy BackTrade to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
NAMESPACE="backtrade"
DRY_RUN=false
SKIP_SECRETS=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-secrets)
            SKIP_SECRETS=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -n, --namespace NAME    Kubernetes namespace (default: backtrade)"
            echo "  --dry-run              Show what would be deployed without applying"
            echo "  --skip-secrets         Skip secrets creation (if using external secrets)"
            echo "  -h, --help            Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}Deploying BackTrade to Kubernetes${NC}"
echo "Namespace: $NAMESPACE"
echo ""

# Function to apply resources
apply_resource() {
    local file=$1
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY-RUN]${NC} Would apply: $file"
        kubectl apply -f "$file" --dry-run=client --namespace="$NAMESPACE" || true
    else
        echo -e "${GREEN}Applying${NC}: $file"
        kubectl apply -f "$file"
    fi
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed or not in PATH${NC}"
    exit 1
fi

# Check cluster connection
echo "Checking cluster connection..."
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster${NC}"
    exit 1
fi
echo -e "${GREEN}Cluster connection OK${NC}"
echo ""

# Create namespace
echo "Creating namespace..."
apply_resource "namespace.yaml"

# Wait for namespace to be ready
if [ "$DRY_RUN" = false ]; then
    sleep 2
fi

# Create ConfigMaps
echo ""
echo "Creating ConfigMaps..."
apply_resource "configmaps/nginx-proxy-config.yaml"
apply_resource "configmaps/nginx-frontend-config.yaml"

# Create Secrets
if [ "$SKIP_SECRETS" = false ]; then
    echo ""
    echo "Checking secrets..."
    if [ ! -f "secrets/secrets.yaml" ]; then
        echo -e "${YELLOW}Warning: secrets/secrets.yaml not found${NC}"
        echo "Copy secrets/secrets-template.yaml to secrets/secrets.yaml and fill in your values"
        echo "Or use --skip-secrets flag if using external secrets management"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "Creating secrets..."
        apply_resource "secrets/secrets.yaml"
    fi
else
    echo -e "${YELLOW}Skipping secrets creation${NC}"
fi

# Deploy PostgreSQL
echo ""
echo "Deploying PostgreSQL..."
apply_resource "postgres/service.yaml"
apply_resource "postgres/statefulset.yaml"

# Deploy Redis
echo ""
echo "Deploying Redis..."
apply_resource "redis/service.yaml"
apply_resource "redis/deployment.yaml"

# Deploy Backend
echo ""
echo "Deploying Backend API..."
apply_resource "backend/service.yaml"
apply_resource "backend/deployment.yaml"

# Deploy Frontend
echo ""
echo "Deploying Frontend..."
apply_resource "frontend/service.yaml"
apply_resource "frontend/deployment.yaml"

# Deploy Proxy
echo ""
echo "Deploying Nginx Proxy..."
apply_resource "proxy/service.yaml"
apply_resource "proxy/deployment.yaml"

# Deploy HPA
echo ""
echo "Deploying Horizontal Pod Autoscalers..."
apply_resource "hpa/backend-hpa.yaml"
apply_resource "hpa/frontend-hpa.yaml"

# Optional: Cloudflared
if [ -f "cloudflared/deployment.yaml" ]; then
    echo ""
    read -p "Deploy Cloudflared tunnel? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Deploying Cloudflared..."
        apply_resource "cloudflared/deployment.yaml"
    fi
fi

# Optional: Ingress
if [ -f "ingress/ingress.yaml" ]; then
    echo ""
    read -p "Deploy Ingress? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Deploying Ingress..."
        apply_resource "ingress/ingress.yaml"
    fi
fi

if [ "$DRY_RUN" = false ]; then
    echo ""
    echo -e "${GREEN}Deployment complete!${NC}"
    echo ""
    echo "Waiting for pods to be ready..."
    kubectl wait --for=condition=ready pod --all -n "$NAMESPACE" --timeout=300s || true
    echo ""
    echo "Current status:"
    kubectl get pods -n "$NAMESPACE"
    echo ""
    echo "Services:"
    kubectl get svc -n "$NAMESPACE"
    echo ""
    echo -e "${GREEN}Deployment successful!${NC}"
else
    echo ""
    echo -e "${YELLOW}Dry-run complete. No changes were made.${NC}"
fi

