# BackTrade API Documentation

## Overview

The BackTrade API is a RESTful API that provides endpoints for managing trading sessions, positions, transactions, instruments, and user accounts. This documentation covers all available endpoints, request/response formats, and authentication mechanisms.

## Base URL

```
https://api.backtrade.com/api/v1
```

For local development:

```
http://localhost:3000/api/v1
```

## Authentication

The API uses JWT (JSON Web Token) based authentication with access and refresh tokens.

### Authentication Flow

1. **Login/Register**: Obtain access and refresh tokens
2. **Authenticated Requests**: Include access token in Authorization header
3. **Token Refresh**: Use refresh token to obtain new access token when expired

### Authorization Header

```
Authorization: Bearer <access_token>
```

### Token Expiration

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

## Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource successfully created
- `204 No Content`: Successful request with no response body
- `400 Bad Request`: Invalid request parameters or body
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## API Resources

### Core Resources

- [Authentication](./authentication.md) - Login, register, password management
- [Users](./users.md) - User management and profile operations
- [Sessions](./sessions.md) - Trading session management
- [Positions](./positions.md) - Position tracking and management
- [Transactions](./transactions.md) - Transaction history and management
- [Instruments](./instruments.md) - Trading instrument management
- [Datasets](./datasets.md) - Market data dataset management
- [Candles](./candles.md) - Candlestick data management
- [Reports](./reports.md) - Session report generation and retrieval

### Supporting Resources

- [Support](./support.md) - Customer support request management
- [Files](./files.md) - File upload and download operations
- [Audit](./audit.md) - Audit log retrieval
- [Plans](./plans.md) - Subscription plan management
- [Subscriptions](./subscriptions.md) - User subscription management
- [Health](./health.md) - System health check
