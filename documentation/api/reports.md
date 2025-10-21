# Reports API

## Overview

The Reports API manages trading session reports, including performance summaries, equity curves, and
statistical analysis of backtesting sessions.

## Endpoints

### GET /reports

Get a paginated list of reports with optional date range filtering.

**Authentication:** Required

**Query Parameters:**

- `start_date` (string, optional): ISO 8601 date
- `end_date` (string, optional): ISO 8601 date
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: created_at)
- `order` (string, optional): Sort order `asc` or `desc` (default: desc)

**Response:** `200 OK`

```json
{
  "reports": [
    {
      "id": 1,
      "session_id": 1,
      "summary_json": {
        "total_trades": 100,
        "winning_trades": 65,
        "losing_trades": 35,
        "win_rate": 65.0,
        "total_pnl": 1250.5,
        "max_drawdown": -234.75,
        "sharpe_ratio": 1.85,
        "profit_factor": 2.34
      },
      "equity_curve_json": {
        "timestamps": ["2023-01-01T00:00:00Z", "2023-01-02T00:00:00Z"],
        "balances": [10000, 10125.5],
        "drawdowns": [0, -50.25]
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated

---

### GET /reports/:id

Get a specific report by ID.

**Authentication:** Required (Session Owner or Admin)

**Path Parameters:**

- `id` (number, required): Report ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "session_id": 1,
  "summary_json": {
    "total_trades": 100,
    "winning_trades": 65,
    "losing_trades": 35,
    "win_rate": 65.0,
    "total_pnl": 1250.50,
    "max_drawdown": -234.75,
    "sharpe_ratio": 1.85,
    "profit_factor": 2.34,
    "avg_trade_duration": "4h 32m",
    "largest_win": 125.75,
    "largest_loss": -85.50,
    "consecutive_wins": 8,
    "consecutive_losses": 4
  },
  "equity_curve_json": {
    "timestamps": [...],
    "balances": [...],
    "drawdowns": [...]
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Report not found

---

### GET /sessions/:sessionId/reports

Get all reports for a specific session.

**Authentication:** Required (Session Owner or Admin)

**Path Parameters:**

- `sessionId` (number, required): Session ID

**Query Parameters:** Same as GET /reports

**Response:** `200 OK` (same format as GET /reports)

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Session not found

---

### POST /reports

Create a new report manually.

**Authentication:** Required

**Request Body:**

```json
{
  "session_id": 1,
  "summary_json": {
    "total_trades": 100,
    "winning_trades": 65,
    "losing_trades": 35,
    "win_rate": 65.0,
    "total_pnl": 1250.50
  },
  "equity_curve_json": {
    "timestamps": [...],
    "balances": [...]
  }
}
```

**Request Schema:**

- `session_id` (number, required): Session ID
- `summary_json` (object, required): Performance summary data
- `equity_curve_json` (object, required): Equity curve data

**Response:** `201 Created`

```json
{
  "id": 1,
  "session_id": 1,
  "summary_json": {...},
  "equity_curve_json": {...},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Session not found
- `422 Unprocessable Entity`: Validation error

---

### POST /sessions/:sessionId/generate-report

Automatically generate a report for a session.

**Authentication:** Required (Session Owner or Admin)

**Path Parameters:**

- `sessionId` (number, required): Session ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "session_id": 1,
  "summary_json": {...},
  "equity_curve_json": {...},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Note:** This endpoint analyzes all positions and transactions in the session and automatically
calculates all metrics.

**Errors:**

- `400 Bad Request`: Session has no data to generate report
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Session not found

---

### PUT /reports/:id

Update an existing report.

**Authentication:** Required (Session Owner or Admin)

**Path Parameters:**

- `id` (number, required): Report ID

**Request Body:**

```json
{
  "summary_json": {
    "total_trades": 101,
    "winning_trades": 66
  },
  "equity_curve_json": {...}
}
```

**Request Schema:**

- `session_id` (number, optional): Session ID
- `summary_json` (object, optional): Performance summary data
- `equity_curve_json` (object, optional): Equity curve data

**Response:** `200 OK`

```json
{
  "id": 1,
  "session_id": 1,
  "summary_json": {...},
  "equity_curve_json": {...},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Report not found

---

### DELETE /reports/:id

Delete a report.

**Authentication:** Required (Session Owner or Admin)

**Path Parameters:**

- `id` (number, required): Report ID

**Response:** `204 No Content`

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Report not found

---
