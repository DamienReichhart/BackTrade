# BackTrade

<div align="center">

![BackTrade Logo](assets/logo/LOGO_256px.png)

**Professional Trading Backtesting Platform**

[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)

_A deterministic multi-session historical trading simulator for professional traders and
quantitative analysts_

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [License](#license)
- [Contact](#contact)

---

## Overview

BackTrade is a sophisticated trading backtesting platform designed for professional traders and
quantitative analysts. The platform provides a deterministic environment where users can launch
trading sessions at any historical timestamp, execute trades as if operating in real-time during
past market conditions, and access detailed performance analytics.

The platform enables comprehensive historical trading simulations with multi-session management,
real-time simulation controls, advanced analytics, and professional-grade trading tools.

## Key Features

### Trading Capabilities

- **Multi-Session Management**: Run multiple concurrent trading sessions with different instruments
  and parameters
- **Real-Time Simulation**: Interactive time controls with play/pause functionality and variable
  speed settings
- **Advanced Analytics**: Comprehensive trading performance metrics and detailed session analytics
- **Professional Tools**: Position management, risk controls, and sophisticated order execution
- **Multiple Instruments**: Support for various trading instruments and timeframes

### Platform Features

- **Role-Based Access**: Tiered subscription system with different session limits and features
- **Modern UI**: Intuitive React-based interface with interactive candlestick charts
- **Scalable Architecture**: Built as a modern monorepo with microservices-ready design
- **Enterprise-Grade Security**: Comprehensive security measures and authentication

## Architecture

BackTrade is built as a modern, scalable monorepo using pnpm workspaces and Turbo for efficient
build orchestration.

### Project Structure

```text
BackTrade/
├── apps/
│   ├── api/                 # Express.js backend API
│   └── web/                 # React frontend application
├── packages/
│   ├── types/               # Shared TypeScript types and Zod schemas
│   ├── utils/               # Shared utilities
│   ├── eslint-config/       # Shared ESLint configuration
│   └── tsconfig/            # Shared TypeScript configuration
├── docker/                  # Docker configuration and images
├── documentation/           # Project documentation and mockups
└── assets/                  # Brand assets and logos
```

## Technology Stack

### Frontend

- **React** - Modern UI framework for building interactive interfaces
- **TypeScript** - Type-safe development
- **Vite** - Fast development and optimized production builds
- **React Router** - Client-side routing
- **TanStack Query** - Server state management and data fetching
- **Zustand** - Lightweight client state management
- **Lightweight Charts** - High-performance candlestick visualization
- **Zod** - Schema validation and type inference
- **Jest** - Comprehensive testing framework

### Backend

- **Node.js** with **Express** - High-performance API server
- **TypeScript** - Type-safe backend development
- **Prisma** - Modern database ORM with type safety
- **PostgreSQL** - Robust relational database
- **Redis** (ioredis) - High-performance caching layer
- **Zod** - Request/response validation
- **Pino** - Structured logging
- **Argon2** - Secure password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection and abuse prevention

### Infrastructure

- **Docker** - Containerization for consistent deployments
- **PostgreSQL** - Production-ready database
- **Redis** - Distributed caching
- **Nginx** - Reverse proxy and load balancing
- **Cloudflare Tunnel** - Secure remote access
- **pnpm** - Efficient package management
- **Turbo** - Monorepo build orchestration

## Getting Started

### Prerequisites

- **Node.js** (latest LTS recommended)
- **pnpm** (latest version)
- **Docker** and **Docker Compose**
- **Git**

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/DamienReichhart/BackTrade.git
    cd BackTrade
    ```

2. **Install dependencies**

    ```bash
    pnpm install
    ```

3. **Configure environment variables**

    The project requires two environment files to be configured:
    - **API environment file**: Create `apps/api/.env` based on `apps/api/.env.example`
    - **Root environment file**:
        - For development: Create `.env` based on `.env.development.example`
        - For production: Create `.env` based on `.env.production.example`

    ```bash
    # Copy API environment file
    cp apps/api/.env.example apps/api/.env

    # Copy root environment file (for development)
    cp .env.development.example .env
    ```

    **Important**: Edit both `.env` files and configure all required values before proceeding.

4.a Docker Development (recommended)

For a complete development environment with database:

```bash
docker compose -f docker-dev.yaml up -d
```

Initialize the database (run Prisma migrations and seed data):

```bash
docker compose -f docker-dev.yaml exec dev pnpm --filter @backtrade/api prisma:init
```

4.b **Start development environment (not recommended)**

```bash
# Using pnpm directly
pnpm dev

# If using real api
cd apps/api && pnpm prisma:init # Require database configured and working in .env

# If using json-server (not recommended)
cd apps/web && pnpm fake-api
# Node : If using json server, do not forget to edit .env.development in apps/web to http://localhost:3001 and restart the server
```

5. **Access the application**
    - **Frontend**: [http://localhost:5173](http://localhost:5173)
    - **API**: [http://localhost:21799](http://localhost:21799)
    - **API Health Check**:
      [http://localhost:21799/api/v1/health](http://localhost:21799/api/v1/health)

## Development

### Code Quality

The project enforces high code quality standards through:

- **ESLint** - Code linting and style enforcement
- **TypeScript** - Static type checking
- **Jest** - Comprehensive test coverage
- **Pre-Commit Hooks** - Automated quality checks

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

### Available Root Scripts

```bash
# Development
pnpm dev              # Start all services in development mode

# Building
pnpm build            # Build all packages and applications

# Code Quality
pnpm lint             # Lint all packages
pnpm typecheck        # Type check all packages
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
```

## Deployment

### Production Deployment

1. **Environment Configuration**

    Configure all required environment variables in the root `.env` file as described in the
    [Configuration](#configuration) section.

2. **Deploy with Docker**

    ```bash
    docker compose -f docker-prod.yaml up -d
    ```

### Docker Services

The production setup includes:

- **Frontend**: React application served by Nginx
- **Backend**: Express.js API server
- **Database**: PostgreSQL with persistent storage
- **Proxy**: Nginx reverse proxy
- **Tunnel**: Cloudflare Tunnel for secure access

## Configuration

### Environment Variables

The project requires **two** `.env` files to be configured:

1. **API Environment File** (`apps/api/.env`):
    - Copy from `apps/api/.env.example`
    - Contains API-specific configuration (database URL, Redis, logging, security, etc.)

2. **Root Environment File** (`.env` in the root directory):
    - For development: Copy from `.env.development.example`
    - For production: Copy from `.env.production.example`
    - Contains Docker service configuration (PostgreSQL, Redis, Cloudflare Tunnel, etc.)

**Important**: Both `.env` files must be created and configured before starting the development
environment or running Docker services. Refer to the example files for detailed variable
descriptions and requirements.

## License

This project is licensed under a **Proprietary License**. See the [LICENSE](LICENSE) file for
details.

**Important**: This is a read-only license. No execution, copying, or distribution rights are
granted.

## Contact

**REICHHART Damien**

- Email: <contact@damien-reichhart.fr>
- Project: BackTrade Trading Platform

---

<div align="center">

**Built with ❤️ for the trading community**

[Report Bug](mailto:contact@damien-reichhart.fr) •
[Request Feature](mailto:contact@damien-reichhart.fr) • [Documentation](documentation/)

</div>
