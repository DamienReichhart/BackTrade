# Positions API

## Overview

The Positions API manages trading positions within sessions, including opening, closing, and
liquidating positions.

## Endpoints

### GET /positions

Get a paginated list of positions with optional date range filtering.

**Authentication:** Required

**Query Parameters:**

- `start_date` (string, optional): ISO 8601 date (filter positions after this date)
- `end_date` (string, optional): ISO 8601 date (filter positions before this date)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: created_at)
- `order` (string, optional): Sort order `asc` or `desc` (default: desc)

**Response:** `200 OK`

```json
{
  "positions": [
    {
      "id": 1,
      "session_id": 1,
      "candle_id": 100,
      "exit_candle_id": 150,
      "position_status": "CLOSED",
      "side": "BUY",
      "entry_price": 1.1234,
      "quantity_lots": 0.1,
      "tp_price": 1.13,
      "sl_price": 1.12,
      "exit_price": 1.128,
      "opened_at": "2024-01-01T10:00:00Z",
      "closed_at": "2024-01-01T14:00:00Z",
      "realized_pnl": 46.0,
      "commission_cost": 7.0,
      "slippage_cost": 2.5,
      "spread_cost": 2.0,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T14:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated

---

### GET /positions/:id

Get a specific position by ID.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): Position ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "session_id": 1,
  "candle_id": 100,
  "exit_candle_id": 150,
  "position_status": "CLOSED",
  "side": "BUY",
  "entry_price": 1.1234,
  "quantity_lots": 0.1,
  "tp_price": 1.13,
  "sl_price": 1.12,
  "exit_price": 1.128,
  "opened_at": "2024-01-01T10:00:00Z",
  "closed_at": "2024-01-01T14:00:00Z",
  "realized_pnl": 46.0,
  "commission_cost": 7.0,
  "slippage_cost": 2.5,
  "spread_cost": 2.0,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T14:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: Position not found

---

### GET /sessions/:sessionId/positions

Get all positions for a specific session.

**Authentication:** Required (Session Owner or Admin)

**Path Parameters:**

- `sessionId` (number, required): Session ID

**Query Parameters:**

- `start_date` (string, optional): ISO 8601 date
- `end_date` (string, optional): ISO 8601 date
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)

**Response:** `200 OK`

```json
{
  "positions": [...],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Session not found

---

### POST /positions

Create a new position (open a trade).

**Authentication:** Required

**Request Body:**

```json
{
  "session_id": 1,
  "candle_id": 100,
  "side": "BUY",
  "entry_price": 1.1234,
  "quantity_lots": 0.1,
  "tp_price": 1.13,
  "sl_price": 1.12
}
```

**Request Schema:**

- `session_id` (number, required): ID of the session
- `candle_id` (number, required): ID of the candle where position opens
- `side` (enum, required): Position side (`BUY` | `SELL`)
- `entry_price` (number, required): Entry price (positive number)
- `quantity_lots` (number, required): Position size in lots (positive number)
- `tp_price` (number, optional): Take profit price (positive number)
- `sl_price` (number, optional): Stop loss price (positive number)

**Response:** `201 Created`

```json
{
  "id": 1,
  "session_id": 1,
  "candle_id": 100,
  "position_status": "OPEN",
  "side": "BUY",
  "entry_price": 1.1234,
  "quantity_lots": 0.1,
  "tp_price": 1.13,
  "sl_price": 1.12,
  "opened_at": "2024-01-01T10:00:00Z",
  "realized_pnl": 0,
  "commission_cost": 7.0,
  "slippage_cost": 0,
  "spread_cost": 2.0,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input or insufficient balance
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Session or candle not found
- `422 Unprocessable Entity`: Validation error

---

### PUT /positions/:id

Update an existing position.

**Authentication:** Required (Session Owner or Admin)

**Path Parameters:**

- `id` (number, required): Position ID

**Request Body:**

```json
{
  "position_status": "CLOSED",
  "exit_candle_id": 150,
  "exit_price": 1.128,
  "closed_at": "2024-01-01T14:00:00Z",
  "realized_pnl": 46.0,
  "commission_cost": 7.0,
  "slippage_cost": 2.5,
  "spread_cost": 2.0
}
```

**Request Schema:**

- `position_status` (enum, optional): Position status (`OPEN` | `CLOSED` | `LIQUIDATED`)
- `exit_candle_id` (number, optional): ID of the candle where position closes
- `exit_price` (number, optional): Exit price (positive number)
- `closed_at` (string, optional): Close timestamp (ISO 8601)
- `realized_pnl` (number, optional): Realized profit/loss
- `commission_cost` (number, optional): Commission cost (non-negative)
- `slippage_cost` (number, optional): Slippage cost (non-negative)
- `spread_cost` (number, optional): Spread cost (non-negative)

**Response:** `200 OK`

```json
{
  "id": 1,
  "session_id": 1,
  "candle_id": 100,
  "exit_candle_id": 150,
  "position_status": "CLOSED",
  "side": "BUY",
  "entry_price": 1.1234,
  "quantity_lots": 0.1,
  "tp_price": 1.13,
  "sl_price": 1.12,
  "exit_price": 1.128,
  "opened_at": "2024-01-01T10:00:00Z",
  "closed_at": "2024-01-01T14:00:00Z",
  "realized_pnl": 46.0,
  "commission_cost": 7.0,
  "slippage_cost": 2.5,
  "spread_cost": 2.0,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T14:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Position not found
- `422 Unprocessable Entity`: Validation error

---

### DELETE /positions/:id

Delete a position.

**Authentication:** Required (Session Owner or Admin)

**Path Parameters:**

- `id` (number, required): Position ID

**Response:** `204 No Content`

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Position not found

---

## Position Lifecycle Operations

### POST /positions/:id/close

Close an open position at market price.

**Authentication:** Required (Session Owner or Admin)

**Path Parameters:**

- `id` (number, required): Position ID

**Request Body:** None (uses current market price)

**Response:** `200 OK`

```json
{
  "id": 1,
  "position_status": "CLOSED",
  "exit_price": 1.1280,
  "closed_at": "2024-01-01T14:00:00Z",
  "realized_pnl": 46.00,
  ...
}
```

**Errors:**

- `400 Bad Request`: Position is not open
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Position not found

---

### POST /positions/:id/liquidate

Liquidate a position (forced closure due to margin call).

**Authentication:** Required (Session Owner or Admin)

**Path Parameters:**

- `id` (number, required): Position ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "position_status": "LIQUIDATED",
  "exit_price": 1.1150,
  "closed_at": "2024-01-01T14:00:00Z",
  "realized_pnl": -84.00,
  ...
}
```

**Errors:**

- `400 Bad Request`: Position is not open
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Position not found

---
