

# BackTrade - Development and Deployment Makefile
# This Makefile provides convenient commands for development, testing, building, and deployment

# Default target
.DEFAULT_GOAL := clean-install

# Phony targets (targets that don't represent files)
.PHONY: install dev test test-watch test-coverage typecheck lint format build build-api build-web clean clean-install docker-dev docker-prod docker-stop docker-logs docker-clean db-reset check

# Variables
NODE_VERSION := 18
PNPM_VERSION := 10.18.1
DOCKER_COMPOSE_DEV := docker-compose -f docker-dev.yaml
DOCKER_COMPOSE_PROD := docker-compose -f docker-prod.yaml

# Windows-specific variables
ifeq ($(OS),Windows_NT)
    RM := del /q /s
    RMDIR := rmdir /s /q
    MKDIR := mkdir
    SEP := \\
else
    RM := rm -rf
    RMDIR := rm -rf
    MKDIR := mkdir -p
    SEP := /
endif

##@ Development

install: ## Install all dependencies
	@echo "Installing dependencies..."
	pnpm install
	@echo "Dependencies installed successfully!"

dev: ## Start development servers
	@echo "Starting development servers..."
	pnpm dev

##@ Code Quality

test: ## Run all tests
	@echo "Running tests..."
	pnpm test
	
test-coverage: ## Run tests with coverage across all apps and merge LCOV
	@echo "Running tests with coverage..."
	pnpm test:coverage
	@echo "Merged coverage available at coverage/lcov.info"


test-watch: ## Run tests in watch mode
	@echo "Running tests in watch mode..."
	pnpm test:watch

typecheck: ## Run TypeScript type checking
	@echo "Running type checking..."
	pnpm typecheck

lint: ## Run ESLint
	@echo "Running linter..."
	pnpm lint

format: ## Format code with Prettier
	@echo "Formatting code..."
	pnpm format

##@ Build

build: ## Build all applications
	@echo "Building applications..."
	pnpm build

build-api: ## Build API only
	@echo "Building API..."
	cd apps/api && pnpm build

build-web: ## Build web application only
	@echo "Building web application..."
	cd apps/web && pnpm build

##@ Docker

docker-dev: ## Start development environment with Docker
	@echo "Starting development environment..."
	$(DOCKER_COMPOSE_DEV) up -d
	@echo "Development environment started!"
	@echo "API: http://localhost:3000"
	@echo "Web: http://localhost:5173"
	@echo "PostgreSQL: localhost:5432"

docker-prod: ## Start production environment with Docker
	@echo "Starting production environment..."
	$(DOCKER_COMPOSE_PROD) up -d
	@echo "Production environment started!"

docker-stop: ## Stop all Docker containers
	@echo "Stopping Docker containers..."
	$(DOCKER_COMPOSE_DEV) down
	$(DOCKER_COMPOSE_PROD) down
	@echo "Docker containers stopped!"

docker-logs: ## Show Docker logs
	@echo "Showing Docker logs..."
	$(DOCKER_COMPOSE_DEV) logs -f

docker-clean: ## Clean Docker containers and images
	@echo "Cleaning Docker resources..."
	docker-compose -f docker-dev.yaml down -v --rmi all
	docker-compose -f docker-prod.yaml down -v --rmi all
	$(RMDIR) docker/datas/postgres
	docker system prune -f
	@echo "Docker resources cleaned!"

##@ Maintenance

clean: ## Clean build artifacts and dependencies
	@echo "Cleaning build artifacts..."
ifeq ($(OS),Windows_NT)
	@if exist apps\api\dist $(RMDIR) apps\api\dist
	@if exist apps\web\dist $(RMDIR) apps\web\dist
	@if exist apps\api\node_modules $(RMDIR) apps\api\node_modules
	@if exist apps\web\node_modules $(RMDIR) apps\web\node_modules
	@if exist packages\config\node_modules $(RMDIR) packages\config\node_modules
	@if exist packages\eslint-config\node_modules $(RMDIR) packages\eslint-config\node_modules
	@if exist packages\tsconfig\node_modules $(RMDIR) packages\tsconfig\node_modules
	@if exist packages\types\node_modules $(RMDIR) packages\types\node_modules
	@if exist node_modules $(RMDIR) node_modules
	@if exist .turbo $(RMDIR) .turbo
else
	$(RM) apps/*/dist
	$(RM) apps/*/node_modules
	$(RM) packages/*/node_modules
	$(RM) node_modules
	$(RM) .turbo
endif
	@echo "Clean completed!"

clean-install: clean install ## Clean and reinstall dependencies
	@echo "Clean install completed!"

##@ Database

db-reset: ## Reset database (development only)
	@echo "Resetting database..."
	$(DOCKER_COMPOSE_DEV) down -v
	$(RMDIR) docker/datas/postgres
	$(DOCKER_COMPOSE_DEV) up -d postgres
	@echo "Database reset completed!"

##@ Utilities

check: ## Check if required tools are installed
	@echo "Checking required tools..."
ifeq ($(OS),Windows_NT)
	@where pnpm >nul 2>&1 || (echo pnpm is required but not installed. Aborting. >&2 && exit /b 1)
	@where docker >nul 2>&1 || (echo docker is required but not installed. Aborting. >&2 && exit /b 1)
	@where docker-compose >nul 2>&1 || (echo docker-compose is required but not installed. Aborting. >&2 && exit /b 1)
else
	@command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required but not installed. Aborting." >&2; exit 1; }
	@command -v docker >/dev/null 2>&1 || { echo "docker is required but not installed. Aborting." >&2; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "docker-compose is required but not installed. Aborting." >&2; exit 1; }
endif
	@echo "All required tools are installed!"
