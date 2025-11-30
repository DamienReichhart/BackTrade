# REST API Specifications

**Base URL :** https://backtrade.damien-reichhart.fr/api  
**Format :** JSON  
**Authentication :** JWT (JSON Web Token)

## Required Headers

### For all requests :

```http
Content-Type: application/json
```

### For protected routes :

```http
Authorization: Bearer {token}
```

### For requests with file upload :

```http
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

## CORS

The server must allow requests from the react frontend running on https://backtrade.damien-reichhart.fr.

Required CORS configuration :

- Origin : https://backtrade.damien-reichhart.fr
- Methods : GET, POST, PUT, DELETE, PATCH
- Headers : Origin, X-Requested-With, Content-Type, Accept, Authorization

## Authentication

The API uses JWT tokens to secure endpoints.

### JWT Token Format

The token contains the following information :

```json
{
  "sub": {
    "id": 1,
    "email": "admin@backtrade.com",
    "role": "ADMIN",
    "is_banned": false,
    "stripe_customer_id": "cus_admin123",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "iat": 123456,
  "exp": 123456
}
```

**Validity duration :** 1 hour

### Token Usage

The token must be included in the Authorization header with the Bearer prefix :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Renewal

The token is not automatically renewable or Refresh token

## HTTP Codes

| Code    | Status                | When to use                                    |
| ------- | --------------------- | ---------------------------------------------- |
| **200** | OK                    | Request successful                             |
| **201** | Created               | Resource created successfully                  |
| **400** | Bad Request           | Malformed request or invalid data              |
| **401** | Unauthorized          | Authentication required or invalid token       |
| **403** | Forbidden             | Access denied (user is not the resource owner) |
| **404** | Not Found             | Resource not found                             |
| **409** | Conflict              | Conflict (e.g., email already used)            |
| **500** | Internal Server Error | Server error                                   |

## Error Format

```json
{
  "error": {
    "message": "Error description",
    "code": "error code"
  }
}
```

## Schemas

| Name                          | Content                                                                                                                                                                                                                                                                                                                                                                | Description                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **PaginationQuery**           | `{ page?: number, limit?: number, sort?: string, order?: 'asc' \| 'desc' }`                                                                                                                                                                                                                                                                                            | Common pagination parameters          |
| **SearchQuery**               | `{ q?: string } & PaginationQuery`                                                                                                                                                                                                                                                                                                                                     | Common search parameters              |
| **DateRangeQuery**            | `{ ts_gte?: string, ts_lte?: string } & PaginationQuery`                                                                                                                                                                                                                                                                                                               | Common date range filter parameters   |
| **PublicUser**                | `{ id: number, email: string, role: Role, is_banned: boolean, stripe_customer_id?: string, created_at: string, updated_at: string }`                                                                                                                                                                                                                                   | Public user data (no password hash)   |
| **Role**                      | `'ADMIN' \| 'USER'`                                                                                                                                                                                                                                                                                                                                                    | User role                             |
| **LoginRequest**              | `{ email: string, password: string }`                                                                                                                                                                                                                                                                                                                                  | Request body for login                |
| **RegisterRequest**           | `{ email: string, password: string, confirmPassword: string }`                                                                                                                                                                                                                                                                                                         | Request body for registration         |
| **AuthResponse**              | `{ user: PublicUser, accessToken: string, refreshToken: string }`                                                                                                                                                                                                                                                                                                      | Response for authentication endpoints |
| **Session**                   | `{ id: number, user_id: number, instrument_id: number, name?: string, session_status: SessionStatus, speed: Speed, start_time: string, current_time: string, end_time?: string, initial_balance: number, leverage: Leverage, spread_pts: number, slippage_pts: number, commission_per_fill: number, created_at: string, updated_at: string }`                          | Trading session entity                |
| **CreateSessionRequest**      | `{ instrument_id: number, name?: string, speed: Speed, start_time: string, current_time: string, end_time?: string, initial_balance: number, leverage: Leverage, spread_pts: number, slippage_pts: number, commission_per_fill: number, user_id: number, session_status: SessionStatus, created_at: string, updated_at: string }`                                      | Payload to create a session           |
| **UpdateSessionRequest**      | `{ name?: string, session_status?: SessionStatus, speed?: Speed, current_time?: string, end_time?: string }`                                                                                                                                                                                                                                                           | Payload to update a session           |
| **Plan**                      | `{ id: number, code: string, stripe_product_id: string, stripe_price_id: string, currency: string, price: number }`                                                                                                                                                                                                                                                    | Subscription plan entity              |
| **CreatePlanRequest**         | `{ code: string, stripe_product_id: string, stripe_price_id: string, currency: string, price: number }`                                                                                                                                                                                                                                                                | Payload to create a plan              |
| **UpdatePlanRequest**         | `{ code?: string, stripe_product_id?: string, stripe_price_id?: string, currency?: string, price?: number }`                                                                                                                                                                                                                                                           | Payload to update a plan              |
| **Subscription**              | `{ id: number, user_id: number, plan_id: number, stripe_subscription_id: string, status: SubscriptionStatus, current_period_start: string, current_period_end: string, cancel_at_period_end: boolean, canceled_at?: string, trial_end?: string }`                                                                                                                      | User subscription entity              |
| **CreateSubscriptionRequest** | `{ user_id: number, plan_id: number, stripe_subscription_id: string, current_period_start: string, current_period_end: string, status?: SubscriptionStatus, cancel_at_period_end: boolean, trial_end?: string }`                                                                                                                                                       | Payload to create a subscription      |
| **UpdateSubscriptionRequest** | `{ status?: SubscriptionStatus, cancel_at_period_end?: boolean, canceled_at?: string, trial_end?: string }`                                                                                                                                                                                                                                                            | Payload to update a subscription      |
| **Transaction**               | `{ id: number, session_id?: number, transaction_type: TransactionType, amount: number, balance_after: number, created_at: string, updated_at: string }`                                                                                                                                                                                                                | Financial transaction entity          |
| **CreateTransactionRequest**  | `{ session_id?: number, transaction_type: TransactionType, amount: number, balance_after: number }`                                                                                                                                                                                                                                                                    | Payload to create a transaction       |
| **Position**                  | `{ id: number, session_id: number, position_status: PositionStatus, side: Side, quantity_lots: number, tp_price?: number, sl_price?: number, entry_price: number, exit_price?: number, opened_at: string, closed_at?: string, realized_pnl?: number, commission_cost?: number, slippage_cost?: number, spread_cost?: number, created_at: string, updated_at: string }` | Trading position entity               |
| **CreatePositionRequest**     | `{ session_id: number, side: Side, entry_price: number, quantity_lots: number, tp_price?: number, sl_price?: number, position_status: PositionStatus, opened_at: string }`                                                                                                                                                                                             | Payload to create a position          |
| **UpdatePositionRequest**     | `{ position_status?: PositionStatus, exit_price?: number, closed_at?: string, realized_pnl?: number, commission_cost?: number, slippage_cost?: number, spread_cost?: number, tp_price?: number, sl_price?: number }`                                                                                                                                                   | Payload to update a position          |
| **ClosePositionRequest**      | `{ position_status: PositionStatus, exit_price: number, closed_at: string }`                                                                                                                                                                                                                                                                                           | Payload to close a position           |
| **Candle**                    | `{ id: number, instrument_id: number, timeframe: Timeframe, ts: string, open: number, high: number, low: number, close: number, volume: number, created_at: string, updated_at: string }`                                                                                                                                                                              | OHLCV Candle entity                   |
| **CreateCandleRequest**       | `{ instrument_id: number, timeframe: Timeframe, ts: string, open: number, high: number, low: number, close: number, volume: number }`                                                                                                                                                                                                                                  | Payload to create a candle            |
| **UpdateCandleRequest**       | `{ instrument_id?: number, timeframe?: Timeframe, timestamp?: string, open?: number, high?: number, low?: number, close?: number, volume?: number }`                                                                                                                                                                                                                   | Payload to update a candle            |
| **CreateCandlesRequest**      | `{ candles: CreateCandleRequest[] }`                                                                                                                                                                                                                                                                                                                                   | Payload to create multiple candles    |
| **Dataset**                   | `{ id: number, instrument_id: number, timeframe: Timeframe, uploaded_at?: string, records_count?: number, file_name?: string, start_time?: string, end_time?: string, created_at: string, updated_at: string }`                                                                                                                                                        | Dataset entity                        |
| **CreateDatasetRequest**      | `{ instrument_id: number, timeframe: Timeframe }`                                                                                                                                                                                                                                                                                                                      | Payload to create a dataset           |
| **UpdateDatasetRequest**      | `{ instrument_id: number, timeframe: Timeframe }`                                                                                                                                                                                                                                                                                                                      | Payload to update a dataset           |
| **Instrument**                | `{ id: number, symbol: string, display_name: string, pip_size: number, created_at: string, updated_at: string }`                                                                                                                                                                                                                                                       | Trading instrument entity             |
| **CreateInstrumentRequest**   | `{ symbol: string, display_name: string, pip_size: number }`                                                                                                                                                                                                                                                                                                           | Payload to create an instrument       |
| **UpdateInstrumentRequest**   | `{ display_name?: string, pip_size?: number }`                                                                                                                                                                                                                                                                                                                         | Payload to update an instrument       |

## API Routes

| Verb       | Endpoint                      | Query Params                  | Request body                | Response type    | Status codes                 | Description                          |
| ---------- | ----------------------------- | ----------------------------- | --------------------------- | ---------------- | ---------------------------- | ------------------------------------ |
| **POST**   | `/auth/login`                 | -                             | `LoginRequest`              | `AuthResponse`   | 200, 400, 401                | Authenticate user                    |
| **POST**   | `/auth/register`              | -                             | `RegisterRequest`           | `AuthResponse`   | 201, 400, 409                | Register new user                    |
| **POST**   | `/auth/refresh-token`         | -                             | `RefreshTokenRequest`       | `AuthResponse`   | 200, 400, 401                | Refresh access token                 |
| **POST**   | `/auth/change-password`       | -                             | `ChangePasswordRequest`     | -                | 200, 400, 401                | Change current user password         |
| **POST**   | `/auth/forgot-password`       | -                             | `ForgotPasswordRequest`     | -                | 200, 400                     | Request password reset email         |
| **POST**   | `/auth/reset-password`        | -                             | `ResetPasswordRequest`      | -                | 200, 400                     | Reset password with code             |
| **GET**    | `/users`                      | `SearchQuery`                 | -                           | `PublicUser[]`   | 200, 401, 403                | List all users (Admin only)          |
| **GET**    | `/users/:id`                  | -                             | -                           | `PublicUser`     | 200, 401, 403, 404           | Get user by ID                       |
| **PATCH**  | `/users/:id`                  | -                             | `UpdateUserRequest`         | `PublicUser`     | 200, 400, 401, 403, 404, 409 | Update user details                  |
| **DELETE** | `/users/:id`                  | -                             | -                           | -                | 204, 401, 403, 404           | Delete user                          |
| **GET**    | `/sessions`                   | `SearchQuery`                 | -                           | `Session[]`      | 200, 401                     | List user sessions                   |
| **GET**    | `/sessions/:id`               | -                             | -                           | `Session`        | 200, 401, 404                | Get session by ID                    |
| **POST**   | `/sessions`                   | -                             | `CreateSessionRequest`      | `Session`        | 201, 400, 401, 403           | Create new session                   |
| **PATCH**  | `/sessions/:id`               | -                             | `UpdateSessionRequest`      | `Session`        | 200, 400, 401, 404           | Update session                       |
| **DELETE** | `/sessions/:id`               | -                             | -                           | -                | 204, 401, 404                | Delete session                       |
| **GET**    | `/sessions/:id/candles`       | -                             | -                           | `Candle[]`       | 200, 401, 403, 404           | List last 2000 candles for a session |
| **GET**    | `/sessions/:id/analyticsFile` | -                             | -                           | `File`           | 200, 401, 403, 404           | Download session analytics file      |
| **GET**    | `/plans`                      | `SearchQuery`                 | -                           | `Plan[]`         | 200                          | List subscription plans              |
| **GET**    | `/plans/:id`                  | -                             | -                           | `Plan`           | 200, 404                     | Get plan by ID                       |
| **POST**   | `/plans`                      | -                             | `CreatePlanRequest`         | `Plan`           | 201, 400, 401, 403           | Create plan (Admin)                  |
| **PATCH**  | `/plans/:id`                  | -                             | `UpdatePlanRequest`         | `Plan`           | 200, 400, 401, 403, 404      | Update plan (Admin)                  |
| **DELETE** | `/plans/:id`                  | -                             | -                           | -                | 204, 401, 403, 404           | Delete plan (Admin)                  |
| **GET**    | `/subscriptions`              | `DateRangeQuery`              | -                           | `Subscription[]` | 200, 401                     | List user subscriptions              |
| **GET**    | `/users/:id/subscriptions`    | `DateRangeQuery`              | -                           | `Subscription[]` | 200, 401, 404                | List subscriptions by user           |
| **GET**    | `/subscriptions/:id`          | -                             | -                           | `Subscription`   | 200, 401, 404                | Get subscription by ID               |
| **POST**   | `/subscriptions`              | -                             | `CreateSubscriptionRequest` | `Subscription`   | 201, 400, 401                | Create subscription                  |
| **PATCH**  | `/subscriptions/:id`          | -                             | `UpdateSubscriptionRequest` | `Subscription`   | 200, 400, 401, 404           | Update subscription                  |
| **DELETE** | `/subscriptions/:id`          | -                             | -                           | -                | 204, 401, 404                | Cancel subscription                  |
| **GET**    | `/transactions`               | `DateRangeQuery`              | -                           | `Transaction[]`  | 200, 401                     | List user transactions               |
| **GET**    | `/users/:id/transactions`     | `DateRangeQuery`              | -                           | `Transaction[]`  | 200, 401, 404                | List transactions by user            |
| **GET**    | `/sessions/:id/transactions`  | `PaginationQuery`             | -                           | `Transaction[]`  | 200, 401, 404                | List transactions by session         |
| **GET**    | `/transactions/:id`           | -                             | -                           | `Transaction`    | 200, 401, 404                | Get transaction by ID                |
| **POST**   | `/transactions`               | -                             | `CreateTransactionRequest`  | `Transaction`    | 201, 400, 401                | Create transaction                   |
| **GET**    | `/positions`                  | `DateRangeQuery`              | -                           | `Position[]`     | 200, 401                     | List all positions                   |
| **GET**    | `/sessions/:id/positions`     | `DateRangeQuery`              | -                           | `Position[]`     | 200, 401, 404                | List positions by session            |
| **GET**    | `/positions/:id`              | -                             | -                           | `Position`       | 200, 401, 404                | Get position by ID                   |
| **POST**   | `/positions`                  | -                             | `CreatePositionRequest`     | `Position`       | 201, 400, 401                | Open new position                    |
| **PATCH**  | `/positions/:id`              | -                             | `UpdatePositionRequest`     | `Position`       | 200, 400, 401, 404           | Update position                      |
| **POST**   | `/positions/:id/close`        | -                             | `ClosePositionRequest`      | `Position`       | 200, 400, 401, 404           | Close position                       |
| **PATCH**  | `/sessions/:id/positions`     | `closeAll=true`               | -                           | -                | 200, 401, 404                | Close all positions for session      |
| **DELETE** | `/positions/:id`              | -                             | -                           | -                | 204, 401, 404                | Delete position                      |
| **GET**    | `/candles`                    | `DateRangeQuery`              | -                           | `Candle[]`       | 200                          | List candles                         |
| **GET**    | `/instruments/:id/candles`    | `timeframe`, `DateRangeQuery` | -                           | `Candle[]`       | 200, 404                     | List candles by instrument           |
| **GET**    | `/datasets/:id/candles`       | `DateRangeQuery`              | -                           | `Candle[]`       | 200, 404                     | List candles by dataset              |
| **POST**   | `/candles`                    | -                             | `CreateCandleRequest`       | `Candle`         | 201, 400, 401, 403           | Create candle (Admin/System)         |
| **POST**   | `/candles/bulk`               | -                             | `CreateCandlesRequest`      | `Candle[]`       | 201, 400, 401, 403           | Bulk create candles                  |
| **PATCH**  | `/candles/:id`                | -                             | `UpdateCandleRequest`       | `Candle`         | 200, 400, 401, 403, 404      | Update candle                        |
| **DELETE** | `/candles/:id`                | -                             | -                           | -                | 204, 401, 403, 404           | Delete candle                        |
| **GET**    | `/datasets`                   | `DateRangeQuery`              | -                           | `Dataset[]`      | 200, 401                     | List datasets                        |
| **GET**    | `/instruments/:id/datasets`   | `DateRangeQuery`              | -                           | `Dataset[]`      | 200, 401, 404                | List datasets by instrument          |
| **GET**    | `/datasets/:id`               | -                             | -                           | `Dataset`        | 200, 401, 404                | Get dataset by ID                    |
| **POST**   | `/datasets`                   | -                             | `CreateDatasetRequest`      | `Dataset`        | 201, 400, 401                | Create dataset                       |
| **PATCH**  | `/datasets/:id`               | -                             | `UpdateDatasetRequest`      | `Dataset`        | 200, 400, 401, 404           | Update dataset                       |
| **DELETE** | `/datasets/:id`               | -                             | -                           | -                | 204, 401, 404                | Delete dataset                       |
| **GET**    | `/instruments`                | `SearchQuery`                 | -                           | `Instrument[]`   | 200                          | List instruments                     |
| **GET**    | `/instruments/:id`            | -                             | -                           | `Instrument`     | 200, 404                     | Get instrument by ID                 |
| **POST**   | `/instruments`                | -                             | `CreateInstrumentRequest`   | `Instrument`     | 201, 400, 401, 403           | Create instrument (Admin)            |
| **PATCH**  | `/instruments/:id`            | -                             | `UpdateInstrumentRequest`   | `Instrument`     | 200, 400, 401, 403, 404      | Update instrument (Admin)            |
| **DELETE** | `/instruments/:id`            | -                             | -                           | -                | 204, 401, 403, 404           | Delete instrument (Admin)            |

### Authentication and authorization

All routes related to resources must be protected by authorization.
The authentication token is transmitted by the front-end in the HTTP header :

```markdown
Authorization: Bearer <token>
```

Before any modification or deletion of a resource, the server must verify that the identifier of the currently authenticated user matches the identifier of the resource owner.
If the identifiers do not match, the request must be rejected with a response :

```json
{
  "error": {
    "message": "You are not authorized to modify this resource",
    "message": "403"
  }
}
```

**HTTP Code :** 403 Forbidden

This verification ensures that only the legitimate owner of a resource is authorized to modify or delete it.

### Public Routes

- GET /instruments
- GET /plans
- POST /auth/login
- POST /auth/register
- POST /auth/refresh-token
- POST /auth/forgot-password
- POST /auth/reset-password

### Protected Routes

All other routes require a valid JWT token.

### Routes with ownership verification

The following routes require that the user be the creator of the resource in question or to be an admin :

- All /sessions routes
- All /positions routes
- All /transactions routes
- All /subscriptions routes
- GET/PATCH/DELETE /users/:id

**Version :** 1.0.0  
**Date :** 22 november 2025
