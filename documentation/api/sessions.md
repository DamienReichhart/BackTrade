# Sessions API

## Overview

The Sessions API manages trading sessions, including creating, updating, controlling session lifecycle (start, pause, resume, stop), and archiving sessions.

## Endpoints

### GET /sessions

Get a paginated list of sessions with optional date range filtering.

**Authentication:** Required

**Query Parameters:**

- `start_date` (string, optional): ISO 8601 date (filter sessions after this date)
- `end_date` (string, optional): ISO 8601 date (filter sessions before this date)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: created_at)
- `order` (string, optional): Sort order `asc` or `desc` (default: desc)

**Response:** `200 OK`

```json
{
  "sessions": [
    {
      "id": 1,
      "user_id": 1,
      "instrument_id": 1,
      "timeframe": "H1",
      "session_status": "RUNNING",
      "speed": "1x",
      "start_ts": "2024-01-01T00:00:00Z",
      "end_ts": "2024-01-31T23:59:59Z",
      "initial_balance": 10000.0,
      "leverage": 100,
      "spread_pts": 20,
      "slippage_pts": 5,
      "commission_per_fill": 7.0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated

---

### GET /sessions/:id

Get a specific session by ID.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): Session ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "user_id": 1,
  "instrument_id": 1,
  "timeframe": "H1",
  "session_status": "RUNNING",
  "speed": "1x",
  "start_ts": "2024-01-01T00:00:00Z",
  "end_ts": "2024-01-31T23:59:59Z",
  "initial_balance": 10000.0,
  "leverage": 100,
  "spread_pts": 20,
  "slippage_pts": 5,
  "commission_per_fill": 7.0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: Session not found

---

### POST /sessions

Create a new trading session.

**Authentication:** Required

**Request Body:**

```json
{
  "instrument_id": 1,
  "timeframe": "H1",
  "speed": "1x",
  "start_ts": "2024-01-01T00:00:00Z",
  "end_ts": "2024-01-31T23:59:59Z",
  "initial_balance": 10000.0,
  "leverage": 100,
  "spread_pts": 20,
  "slippage_pts": 5,
  "commission_per_fill": 7.0
}
```

**Request Schema:**

- `instrument_id` (number, required): ID of the trading instrument
- `timeframe` (enum, required): Candlestick timeframe (`M1` | `M5` | `M10` | `M15` | `M30` | `H1` | `H2` | `H4` | `D1` | `W1`)
- `speed` (enum, required): Playback speed (`0.5x` | `1x` | `2x` | `3x` | `5x` | `10x` | `15x`)
- `start_ts` (string, required): Session start timestamp (ISO 8601)
- `end_ts` (string, optional): Session end timestamp (ISO 8601)
- `initial_balance` (number, required): Starting balance (positive number)
- `leverage` (number, required): Leverage ratio (positive number)
- `spread_pts` (number, required): Spread in points (non-negative integer)
- `slippage_pts` (number, required): Slippage in points (non-negative integer)
- `commission_per_fill` (number, required): Commission per fill (non-negative number)

**Response:** `201 Created`

```json
{
  "id": 1,
  "user_id": 1,
  "instrument_id": 1,
  "timeframe": "H1",
  "session_status": "DRAFT",
  "speed": "1x",
  "start_ts": "2024-01-01T00:00:00Z",
  "end_ts": "2024-01-31T23:59:59Z",
  "initial_balance": 10000.0,
  "leverage": 100,
  "spread_pts": 20,
  "slippage_pts": 5,
  "commission_per_fill": 7.0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `422 Unprocessable Entity`: Validation error

---

### PUT /sessions/:id

Update an existing session.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): Session ID

**Request Body:**

```json
{
  "session_status": "PAUSED",
  "speed": "2x",
  "end_ts": "2024-02-01T23:59:59Z"
}
```

**Request Schema:**

- `session_status` (enum, optional): Session status (`DRAFT` | `RUNNING` | `PAUSED` | `COMPLETED` | `ARCHIVED`)
- `speed` (enum, optional): Playback speed
- `end_ts` (string, optional): Session end timestamp (ISO 8601)

**Response:** `200 OK`

```json
{
  "id": 1,
  "user_id": 1,
  "instrument_id": 1,
  "timeframe": "H1",
  "session_status": "PAUSED",
  "speed": "2x",
  "start_ts": "2024-01-01T00:00:00Z",
  "end_ts": "2024-02-01T23:59:59Z",
  "initial_balance": 10000.0,
  "leverage": 100,
  "spread_pts": 20,
  "slippage_pts": 5,
  "commission_per_fill": 7.0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-05T12:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: Session not found
- `422 Unprocessable Entity`: Validation error

---

### DELETE /sessions/:id

Delete a session.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): Session ID

**Response:** `204 No Content`

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: Session not found

---

## Session Lifecycle Operations

### POST /sessions/:id/start

Start a session (transition from DRAFT to RUNNING).

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): Session ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "user_id": 1,
  "instrument_id": 1,
  "timeframe": "H1",
  "session_status": "RUNNING",
  "speed": "1x",
  "start_ts": "2024-01-01T00:00:00Z",
  "end_ts": "2024-01-31T23:59:59Z",
  "initial_balance": 10000.0,
  "leverage": 100,
  "spread_pts": 20,
  "slippage_pts": 5,
  "commission_per_fill": 7.0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid state transition
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: Session not found

---

### POST /sessions/:id/pause

Pause a running session.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): Session ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "session_status": "PAUSED",
  ...
}
```

**Errors:**

- `400 Bad Request`: Session is not running
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: Session not found

---

### POST /sessions/:id/resume

Resume a paused session.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): Session ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "session_status": "RUNNING",
  ...
}
```

**Errors:**

- `400 Bad Request`: Session is not paused
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: Session not found

---

### POST /sessions/:id/stop

Stop a session (transition to COMPLETED).

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): Session ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "session_status": "COMPLETED",
  ...
}
```

**Errors:**

- `400 Bad Request`: Invalid state transition
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: Session not found

---

### POST /sessions/:id/archive

Archive a completed session.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): Session ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "session_status": "ARCHIVED",
  ...
}
```

**Errors:**

- `400 Bad Request`: Session is not completed
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: Session not found

---

## Nested Resources

### GET /sessions/:sessionId/positions

Get all positions for a specific session.

See [Positions API - Get Positions by Session](./positions.md#get-sessionssession_idpositions)

---

### GET /sessions/:sessionId/transactions

Get all transactions for a specific session.

See [Transactions API - Get Transactions by Session](./transactions.md#get-sessionssession_idtransactions)

---

### GET /sessions/:sessionId/reports

Get all reports for a specific session.

See [Reports API - Get Reports by Session](./reports.md#get-sessionssession_idreports)

---

### POST /sessions/:sessionId/generate-report

Generate a new report for a session.

See [Reports API - Generate Report](./reports.md#post-sessionssession_idgenerate-report)

---
