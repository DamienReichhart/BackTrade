# BackTrade Makefile
# Provides convenient commands for development, testing, and deployment

# Variables
DOCKER_COMPOSE_DEV := docker compose -f docker-dev.yaml
DOCKER_COMPOSE_PROD := docker compose -f docker-prod.yaml
DEV_SERVICE := dev
API_FILTER := --filter @backtrade/api
PNPM := pnpm

.PHONY: help
help: ## Display this help message
	@echo "BackTrade Makefile Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'
	@echo ""

# =============================================================================
# Development Environment
# =============================================================================

.PHONY: dev
dev: ## Start development environment (detached mode)
	@echo "Starting development environment..."
	$(DOCKER_COMPOSE_DEV) up -d

.PHONY: dev-build
dev-build: ## Build and start development environment
	@echo "Building and starting development environment..."
	$(DOCKER_COMPOSE_DEV) up -d --build

.PHONY: dev-stop
dev-stop: ## Stop development environment
	@echo "Stopping development environment..."
	$(DOCKER_COMPOSE_DEV) stop

.PHONY: dev-down
dev-down: ## Stop and remove development containers
	@echo "Stopping and removing development containers..."
	$(DOCKER_COMPOSE_DEV) down

.PHONY: dev-logs
dev-logs: ## View development environment logs (follow mode)
	$(DOCKER_COMPOSE_DEV) logs -f

.PHONY: dev-shell
dev-shell: ## Open shell in development container
	$(DOCKER_COMPOSE_DEV) exec $(DEV_SERVICE) /bin/sh

.PHONY: dev-restart
dev-restart: ## Restart development environment
	@echo "Restarting development environment..."
	$(DOCKER_COMPOSE_DEV) restart

# =============================================================================
# Production Environment
# =============================================================================

.PHONY: prod
prod: ## Start production environment (detached mode)
	@echo "Starting production environment..."
	$(DOCKER_COMPOSE_PROD) up -d

.PHONY: prod-build
prod-build: ## Build and start production environment
	@echo "Building and starting production environment..."
	$(DOCKER_COMPOSE_PROD) up -d --build

.PHONY: prod-stop
prod-stop: ## Stop production environment
	@echo "Stopping production environment..."
	$(DOCKER_COMPOSE_PROD) stop

.PHONY: prod-down
prod-down: ## Stop and remove production containers
	@echo "Stopping and removing production containers..."
	$(DOCKER_COMPOSE_PROD) down

.PHONY: prod-logs
prod-logs: ## View production environment logs (follow mode)
	$(DOCKER_COMPOSE_PROD) logs -f

.PHONY: prod-restart
prod-restart: ## Restart production environment
	@echo "Restarting production environment..."
	$(DOCKER_COMPOSE_PROD) restart

# =============================================================================
# Database Management
# =============================================================================

.PHONY: db-init
db-init: ## Initialize database (generate, deploy migrations, and seed)
	@echo "Initializing database..."
	$(DOCKER_COMPOSE_DEV) exec $(DEV_SERVICE) $(PNPM) $(API_FILTER) prisma:init

.PHONY: db-generate
db-generate: ## Generate Prisma client
	@echo "Generating Prisma client..."
	$(DOCKER_COMPOSE_DEV) exec $(DEV_SERVICE) $(PNPM) $(API_FILTER) prisma:generate

.PHONY: db-migrate
db-migrate: ## Run Prisma migrations in development mode
	@echo "Running Prisma migrations..."
	$(DOCKER_COMPOSE_DEV) exec $(DEV_SERVICE) $(PNPM) $(API_FILTER) prisma:migrate

.PHONY: db-deploy
db-deploy: ## Deploy Prisma migrations (production mode)
	@echo "Deploying Prisma migrations..."
	$(DOCKER_COMPOSE_DEV) exec $(DEV_SERVICE) $(PNPM) $(API_FILTER) prisma:deploy

.PHONY: db-seed
db-seed: ## Seed database with initial data
	@echo "Seeding database..."
	$(DOCKER_COMPOSE_DEV) exec $(DEV_SERVICE) $(PNPM) $(API_FILTER) prisma:seed

.PHONY: db-studio
db-studio: ## Open Prisma Studio (database GUI)
	@echo "Opening Prisma Studio..."
	$(DOCKER_COMPOSE_DEV) exec $(DEV_SERVICE) $(PNPM) $(API_FILTER) prisma:studio

.PHONY: db-reset
db-reset: ## Reset database (WARNING: deletes all data)
	@echo "⚠️  WARNING: This will delete all database data!"
	@echo "Run manually: $(DOCKER_COMPOSE_DEV) exec $(DEV_SERVICE) $(PNPM) $(API_FILTER) prisma:reset"

# =============================================================================
# Dependencies
# =============================================================================

.PHONY: install
install: ## Install all dependencies
	@echo "Installing dependencies..."
	$(PNPM) install

.PHONY: install-dev
install-dev: dev ## Install dependencies and start dev environment
	@echo "Installing dependencies and starting dev environment..."
	$(DOCKER_COMPOSE_DEV) exec $(DEV_SERVICE) $(PNPM) install

# =============================================================================
# Code Quality
# =============================================================================

.PHONY: lint
lint: ## Run ESLint on all packages
	@echo "Running ESLint..."
	$(PNPM) lint

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	@echo "Running TypeScript type check..."
	$(PNPM) typecheck

.PHONY: format
format: ## Format code with Prettier
	@echo "Formatting code..."
	$(PNPM) format

.PHONY: format-check
format-check: ## Check code formatting
	@echo "Checking code formatting..."
	$(PNPM) format:check

.PHONY: test
test: ## Run all tests
	@echo "Running tests..."
	$(PNPM) test

.PHONY: test-coverage
test-coverage: ## Run tests with coverage report
	@echo "Running tests with coverage..."
	$(PNPM) test:coverage

.PHONY: quality
quality: lint typecheck format-check ## Run all code quality checks

# =============================================================================
# Build & Start
# =============================================================================

.PHONY: build
build: ## Build all packages and applications
	@echo "Building all packages..."
	$(PNPM) build

.PHONY: start
start: ## Start all services (non-docker)
	@echo "Starting all services..."
	$(PNPM) start

# =============================================================================
# Cleanup
# =============================================================================

.PHONY: clean
clean: ## Clean build artifacts and node_modules
	@echo "Cleaning build artifacts..."
	@find . -type d -name "node_modules" -prune -o -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".turbo" -exec rm -rf {} + 2>/dev/null || true

.PHONY: clean-all
clean-all: clean ## Clean everything including Docker volumes
	@echo "Cleaning Docker volumes and containers..."
	$(DOCKER_COMPOSE_DEV) down -v 2>/dev/null || true
	$(DOCKER_COMPOSE_PROD) down -v 2>/dev/null || true

.PHONY: prune
prune: ## Remove unused Docker resources
	@echo "Pruning Docker resources..."
	docker system prune -f

# =============================================================================
# Quick Setup
# =============================================================================

.PHONY: setup
setup: install dev-build db-init ## Complete setup: install, build, start dev, and init database
	@echo " Setup complete!"
	@echo "Frontend: http://localhost:5173"
	@echo "API: http://localhost:21799"
	@echo "Health Check: http://localhost:21799/api/v1/health"
