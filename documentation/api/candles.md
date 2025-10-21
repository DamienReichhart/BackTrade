# Candles API

## Overview

The Candles API provides access to candlestick (OHLC) market data used for backtesting. Candles
represent price movements over specific time intervals.

## Endpoints

### GET /candles

Get a paginated list of candles with optional date range filtering.

**Authentication:** Required

**Query Parameters:**

- `start_date` (string, optional): ISO 8601 date
- `end_date` (string, optional): ISO 8601 date
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: ts)
- `order` (string, optional): Sort order `asc` or `desc` (default: asc)

**Response:** `200 OK`

```json
{
  "candles": [
    {
      "id": 1,
      "instrument_id": 1,
      "timeframe": "H1",
      "ts": "2023-01-01T00:00:00Z",
      "open": 1.1234,
      "high": 1.125,
      "low": 1.123,
      "close": 1.1245,
      "volume": 1000,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 8760,
  "page": 1,
  "limit": 20
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated

---

### GET /candles/:id

Get a specific candle by ID.

**Authentication:** Required

**Path Parameters:**

- `id` (number, required): Candle ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "instrument_id": 1,
  "timeframe": "H1",
  "ts": "2023-01-01T00:00:00Z",
  "open": 1.1234,
  "high": 1.125,
  "low": 1.123,
  "close": 1.1245,
  "volume": 1000,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Candle not found

---

### GET /instruments/:instrumentId/candles

Get candles for a specific instrument and timeframe.

**Authentication:** Required

**Path Parameters:**

- `instrumentId` (number, required): Instrument ID

**Query Parameters:**

- `timeframe` (string, required): Timeframe (`M1` | `M5` | `M10` | `M15` | `M30` | `H1` | `H2` |
  `H4` | `D1` | `W1`)
- `start_date` (string, optional): ISO 8601 date
- `end_date` (string, optional): ISO 8601 date
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response:** `200 OK` (same format as GET /candles)

**Errors:**

- `400 Bad Request`: Missing or invalid timeframe
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Instrument not found

---

### GET /datasets/:datasetId/candles

Get all candles for a specific dataset.

**Authentication:** Required

**Path Parameters:**

- `datasetId` (number, required): Dataset ID

**Query Parameters:** Same as GET /candles

**Response:** `200 OK` (same format as GET /candles)

**Errors:**

- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Dataset not found

---

### POST /candles

Create a new candle.

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "instrument_id": 1,
  "timeframe": "H1",
  "ts": "2023-01-01T00:00:00Z",
  "open": 1.1234,
  "high": 1.125,
  "low": 1.123,
  "close": 1.1245,
  "volume": 1000
}
```

**Request Schema:**

- `instrument_id` (number, required): Instrument ID
- `timeframe` (enum, required): Timeframe
- `ts` (string, required): Candle timestamp (ISO 8601)
- `open` (number, required): Open price (positive)
- `high` (number, required): High price (positive)
- `low` (number, required): Low price (positive)
- `close` (number, required): Close price (positive)
- `volume` (number, required): Volume (non-negative)

**Validation:**

- `high >= max(open, close, low)`
- `low <= min(open, close, high)`

**Response:** `201 Created`

```json
{
  "id": 1,
  "instrument_id": 1,
  "timeframe": "H1",
  "ts": "2023-01-01T00:00:00Z",
  "open": 1.1234,
  "high": 1.125,
  "low": 1.123,
  "close": 1.1245,
  "volume": 1000,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input or OHLC validation failed
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Instrument not found
- `409 Conflict`: Candle already exists for this timestamp
- `422 Unprocessable Entity`: Validation error

---

### POST /candles/bulk

Create multiple candles in a single request.

**Authentication:** Required (Admin)

**Request Body:**

```json
[
  {
    "instrument_id": 1,
    "timeframe": "H1",
    "ts": "2023-01-01T00:00:00Z",
    "open": 1.1234,
    "high": 1.125,
    "low": 1.123,
    "close": 1.1245,
    "volume": 1000
  },
  {
    "instrument_id": 1,
    "timeframe": "H1",
    "ts": "2023-01-01T01:00:00Z",
    "open": 1.1245,
    "high": 1.126,
    "low": 1.124,
    "close": 1.1255,
    "volume": 1200
  }
]
```

**Response:** `201 Created`

```json
[
  {
    "id": 1,
    ...
  },
  {
    "id": 2,
    ...
  }
]
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `422 Unprocessable Entity`: Validation error

---

### PUT /candles/:id

Update an existing candle.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Candle ID

**Request Body:**

```json
{
  "open": 1.1235,
  "high": 1.1251,
  "low": 1.1231,
  "close": 1.1246,
  "volume": 1050
}
```

**Request Schema:**

- `instrument_id` (number, optional): Instrument ID
- `timeframe` (enum, optional): Timeframe
- `ts` (string, optional): Timestamp
- `open` (number, optional): Open price
- `high` (number, optional): High price
- `low` (number, optional): Low price
- `close` (number, optional): Close price
- `volume` (number, optional): Volume

**Response:** `200 OK`

```json
{
  "id": 1,
  "open": 1.1235,
  "high": 1.1251,
  "low": 1.1231,
  "close": 1.1246,
  "volume": 1050,
  ...
}
```

**Errors:**

- `400 Bad Request`: Invalid input or OHLC validation failed
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Candle not found

---

### DELETE /candles/:id

Delete a candle.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Candle ID

**Response:** `204 No Content`

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Candle not found

---
