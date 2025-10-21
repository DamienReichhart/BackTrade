# BackTrade

<div align="center">

![BackTrade Logo](assets/logo/LOGO_256px.png)

**Professional Trading Backtesting Platform**

[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Javascript](https://img.shields.io/badge/Javascript-blue.svg)](https://www.javascript.com/)
[![React](https://img.shields.io/badge/React-19.1+-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)

_A deterministic multi-session historical trading simulator for professional traders and
quantitative analysts_

</div>

---

## Overview

BackTrade is a sophisticated trading backtesting platform that enables professional traders and
quantitative analysts to conduct comprehensive historical trading simulations. The platform provides
a deterministic environment where users can launch trading sessions at any historical timestamp,
execute trades as if operating in real-time during past market conditions, and access detailed
performance analytics.

### Key Features

- ** Multi-Session Management**: Run multiple concurrent trading sessions with different instruments
  and parameters
- ** Real-Time Simulation**: Interactive time controls with play/pause functionality and variable
  speed settings (0.5x to 10x)
- ** Advanced Analytics**: Comprehensive trading performance metrics and detailed session reports
- ** Professional Tools**: Position management, risk controls, and sophisticated order execution
- ** Role-Based Access**: Tiered subscription system with different session limits and features
- ** Multiple Instruments**: Support for various trading instruments (XAUUSD, EURUSD, etc.) and
  timeframes
- ** Modern UI**: Intuitive React-based interface with interactive candlestick charts

## Architecture

BackTrade is built as a modern, scalable monorepo:

### Technology Stack

**Frontend:**

- **React 19.1+** with Javascript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **TanStack Query** for server state management
- **Vitest** for testing

**Backend:**

- **Node.js 18+** with Express 5.1
- **Pino** for structured logging

**Infrastructure:**

- **Docker** containerization
- **PostgreSQL** database
- **Nginx** proxy
- **Cloudflare Tunnel** for secure access
- **pnpm** workspace management
- **Turbo** for monorepo orchestration

### Project Structure

```
BackTrade/
├── apps/
│   ├── api/                 # Express.js backend API
│   └── web/                 # React frontend application
├── docker/                  # Docker configuration and images
├── documentation/           # Project documentation and mockups
└── assets/                  # Brand assets and logos
```

## Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **pnpm** 10.18.1 or higher
- **Docker** and **Docker Compose**
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd BackTrade
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development environment**

   ```bash
   # Using Makefile (recommended)
   make dev

   # Or using pnpm directly
   pnpm dev
   ```

4. **Access the application**
   - **Frontend**: http://localhost:5173
   - **API**: http://localhost:3000

### Docker Development

For a complete development environment with database:

```bash
# Start development environment
make docker-dev

# Or manually
docker-compose -f docker-dev.yaml up -d
```

## 🛠️ Development

### Available Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `make dev`           | Start development servers    |
| `make build`         | Build all applications       |
| `make test`          | Run all tests                |
| `make test:coverage` | Run tests with coverage      |
| `make lint`          | Run ESLint                   |
| `make format`        | Format code with Prettier    |
| `make clean`         | Clean build artifacts        |

### Code Quality

The project enforces high code quality standards:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Vitest** for comprehensive testing
- **Pre-Commit** for git hooks

### Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## Deployment

### Production Deployment

1. **Environment Configuration**
   - Set up environment variables
   - Configure database connection
   - Set up Cloudflare Tunnel token

2. **Deploy the application**

   ```bash
   docker compose -f docker-prod.yaml up -d --build
   ```

### Docker Services

The production setup includes:

- **Frontend**: React application served by Nginx
- **Backend**: Express.js API server
- **Database**: PostgreSQL with persistent storage
- **Proxy**: Nginx proxy
- **Tunnel**: Cloudflare Tunnel for secure access

## Core Features

### Trading Sessions

- Create sessions with custom instruments and timeframes
- Configure initial balance, leverage, and risk parameters
- Set spread, slippage, and commission models

### Real-Time Simulation

- Interactive time controls (play/pause/speed)
- Live candlestick chart visualization
- Real-time position tracking and P&L updates

### Position Management

- Market order execution (Buy/Sell)
- Take Profit and Stop Loss levels
- Dynamic TP/SL modification
- Bulk position management

### Analytics & Reporting

- Comprehensive performance metrics
- Detailed session reports
- Historical trade analysis
- Risk assessment tools

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/backtrade"

# API Configuration
API_PORT=3000
API_HOST=0.0.0.0

# Security
JWT_SECRET="your-jwt-secret"
ENCRYPTION_KEY="your-encryption-key"

# Cloudflare Tunnel
TUNNEL_TOKEN="your-tunnel-token"
```

## Contributing

This is a proprietary project. Please contact the author for contribution guidelines and access
permissions.

## License

This project is licensed under a **Proprietary License**. See the [LICENSE](LICENSE) file for
details.

**Important**: This is a read-only license. No execution, copying, or distribution rights are
granted.

## 👨‍💻 Author

**REICHHART Damien**

- Email: contact@damien-reichhart.fr
- Project: BackTrade Trading Platform

<div align="center">

**Built with ❤️ for the trading community**

[Report Bug](mailto:contact@damien-reichhart.fr) •
[Request Feature](mailto:contact@damien-reichhart.fr) • [Documentation](documentation/)

</div>
