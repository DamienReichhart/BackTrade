# Quick Start Guide - Kubernetes Deployment

This guide will help you quickly deploy BackTrade to Kubernetes.

## Step-by-Step Deployment

### 1. Build and Push Docker Images

```bash
# Set your registry
export REGISTRY=docker.io/reichhartdamien
export VERSION=v1.0.0

# Build and push
cd k8s
./scripts/build-and-push-images.sh -r $REGISTRY -v $VERSION

# Or use Makefile
make push REGISTRY=$REGISTRY VERSION=$VERSION
```

### 2. Create Secrets

```bash
# Copy template
cp secrets/secrets-template.yaml secrets/secrets.yaml

# Edit with your actual values
# Generate secure passwords:
openssl rand -base64 32  # For POSTGRES_PASSWORD
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For ENCRYPTION_KEY

# Update secrets/secrets.yaml with your values
# Update DATABASE_URL with the postgres password
```

### 3. Update Image References

- `kustomization.yaml`:
- `backend/deployment.yaml`
- `frontend/deployment.yaml`

### 4. Deploy

**Option A: Using the deployment script**

```bash
cd k8s
./scripts/deploy.sh

# Or for PowerShell
.\scripts\deploy.ps1
```

**Option B: Using kubectl directly**

```bash
cd k8s
kubectl apply -f namespace.yaml
kubectl apply -f configmaps/
kubectl apply -f secrets/secrets.yaml
kubectl apply -f postgres/
kubectl apply -f backend/
kubectl apply -f frontend/
kubectl apply -f proxy/
kubectl apply -f hpa/
```

### 5. Verify Deployment

```bash
# Check pods are running
kubectl get pods -n backtrade

# Check services
kubectl get svc -n backtrade

# View logs
kubectl logs -n backtrade -l app=api --tail=100
```

### 6. Access the Application

**Option 1: LoadBalancer (Default)**

```bash
# Get external IP
kubectl get svc -n backtrade backtrade-proxy

# Access via external IP on port 80
```

**Option 2: Port Forwarding (Development)**

```bash
kubectl port-forward -n backtrade svc/backtrade-proxy 8080:80
# Access at http://localhost:8080
```

**Option 3: Ingress**

1. Update `ingress/ingress.yaml` with your domain
2. Apply: `kubectl apply -f ingress/ingress.yaml`

**Option 4: Cloudflare Tunnel**

1. Set `TUNNEL_TOKEN` in secrets
2. Apply: `kubectl apply -f cloudflared/deployment.yaml`
3. Access on configured adresse

## Common Tasks

### View Status

```bash
kubectl get pods,svc,deployments -n backtrade
```

### View Logs

```bash
kubectl logs -n backtrade -l app=api -f
```

### Update Deployment

```bash
# Update image
kubectl set image deployment/backtrade-api -n backtrade api=docker.io/reichhartdamien/backtrade-api:v1.0.0

# Rollback
kubectl rollout undo deployment/backtrade-api -n backtrade

# Check status
kubectl rollout status deployment/backtrade-api -n backtrade
```

### Scale Manually

```bash
# Scale backend
kubectl scale deployment backtrade-api -n backtrade --replicas=5

# Scale frontend
kubectl scale deployment backtrade-frontend -n backtrade --replicas=3
```

### Delete Everything

```bash
kubectl delete namespace backtrade
```
