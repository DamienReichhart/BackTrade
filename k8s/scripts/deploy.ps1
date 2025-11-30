# BackTrade Kubernetes Deployment Script (PowerShell)
# This script helps deploy BackTrade to Kubernetes

param(
    [string]$Namespace = "backtrade",
    [switch]$DryRun,
    [switch]$SkipSecrets
)

$ErrorActionPreference = "Stop"

# Colors for output (PowerShell 5.1+)
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "Deploying BackTrade to Kubernetes"
Write-Output "Namespace: $Namespace"
Write-Output ""

# Function to apply resources
function Apply-Resource {
    param(
        [string]$File
    )
    
    if ($DryRun) {
        Write-ColorOutput Yellow "[DRY-RUN] Would apply: $File"
        kubectl apply -f $File --dry-run=client --namespace=$Namespace 2>&1 | Out-Null
    } else {
        Write-ColorOutput Green "Applying: $File"
        kubectl apply -f $File
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to apply $File"
        }
    }
}

# Check if kubectl is available
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Red "Error: kubectl is not installed or not in PATH"
    exit 1
}

# Check cluster connection
Write-Output "Checking cluster connection..."
try {
    kubectl cluster-info | Out-Null
    Write-ColorOutput Green "Cluster connection OK"
} catch {
    Write-ColorOutput Red "Error: Cannot connect to Kubernetes cluster"
    exit 1
}
Write-Output ""

# Create namespace
Write-Output "Creating namespace..."
Apply-Resource "namespace.yaml"

# Wait for namespace to be ready
if (-not $DryRun) {
    Start-Sleep -Seconds 2
}

# Create ConfigMaps
Write-Output ""
Write-Output "Creating ConfigMaps..."
Apply-Resource "configmaps/nginx-proxy-config.yaml"
Apply-Resource "configmaps/nginx-frontend-config.yaml"

# Create Secrets
if (-not $SkipSecrets) {
    Write-Output ""
    Write-Output "Checking secrets..."
    if (-not (Test-Path "secrets/secrets.yaml")) {
        Write-ColorOutput Yellow "Warning: secrets/secrets.yaml not found"
        Write-Output "Copy secrets/secrets-template.yaml to secrets/secrets.yaml and fill in your values"
        Write-Output "Or use -SkipSecrets flag if using external secrets management"
        $response = Read-Host "Continue anyway? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            exit 1
        }
    } else {
        Write-Output "Creating secrets..."
        Apply-Resource "secrets/secrets.yaml"
    }
} else {
    Write-ColorOutput Yellow "Skipping secrets creation"
}

# Deploy PostgreSQL
Write-Output ""
Write-Output "Deploying PostgreSQL..."
Apply-Resource "postgres/service.yaml"
Apply-Resource "postgres/statefulset.yaml"

# Deploy Backend
Write-Output ""
Write-Output "Deploying Backend API..."
Apply-Resource "backend/service.yaml"
Apply-Resource "backend/deployment.yaml"

# Deploy Frontend
Write-Output ""
Write-Output "Deploying Frontend..."
Apply-Resource "frontend/service.yaml"
Apply-Resource "frontend/deployment.yaml"

# Deploy Proxy
Write-Output ""
Write-Output "Deploying Nginx Proxy..."
Apply-Resource "proxy/service.yaml"
Apply-Resource "proxy/deployment.yaml"

# Deploy HPA
Write-Output ""
Write-Output "Deploying Horizontal Pod Autoscalers..."
Apply-Resource "hpa/backend-hpa.yaml"
Apply-Resource "hpa/frontend-hpa.yaml"

# Optional: Cloudflared
if (Test-Path "cloudflared/deployment.yaml") {
    Write-Output ""
    $response = Read-Host "Deploy Cloudflared tunnel? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Output "Deploying Cloudflared..."
        Apply-Resource "cloudflared/deployment.yaml"
    }
}

# Optional: Ingress
if (Test-Path "ingress/ingress.yaml") {
    Write-Output ""
    $response = Read-Host "Deploy Ingress? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Output "Deploying Ingress..."
        Apply-Resource "ingress/ingress.yaml"
    }
}

if (-not $DryRun) {
    Write-Output ""
    Write-ColorOutput Green "Deployment complete!"
    Write-Output ""
    Write-Output "Waiting for pods to be ready..."
    kubectl wait --for=condition=ready pod --all -n $Namespace --timeout=300s 2>&1 | Out-Null
    Write-Output ""
    Write-Output "Current status:"
    kubectl get pods -n $Namespace
    Write-Output ""
    Write-Output "Services:"
    kubectl get svc -n $Namespace
    Write-Output ""
    Write-ColorOutput Green "Deployment successful!"
} else {
    Write-Output ""
    Write-ColorOutput Yellow "Dry-run complete. No changes were made."
}

