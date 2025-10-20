# Instruments API

## Overview

The Instruments API manages trading instruments (currency pairs, stocks, commodities, etc.) available for backtesting.

## Endpoints

### GET /instruments

Get a paginated list of instruments.

**Authentication:** Required

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: symbol)
- `order` (string, optional): Sort order `asc` or `desc` (default: asc)

**Response:** `200 OK`

```json
{
  "instruments": [
    {
      "id": 1,
      "symbol": "EURUSD",
      "display_name": "Euro / US Dollar",
      "pip_size": 0.0001,
      "enabled": true,
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

### GET /instruments/:id

Get a specific instrument by ID.

**Authentication:** Required

**Path Parameters:**

- `id` (number, required): Instrument ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "symbol": "EURUSD",
  "display_name": "Euro / US Dollar",
  "pip_size": 0.0001,
  "enabled": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Instrument not found

---

### POST /instruments

Create a new instrument.

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "symbol": "GBPUSD",
  "display_name": "British Pound / US Dollar",
  "pip_size": 0.0001,
  "enabled": true
}
```

**Request Schema:**

- `symbol` (string, required): Instrument symbol (e.g., "EURUSD", "AAPL")
- `display_name` (string, required): Human-readable name
- `pip_size` (number, required): Pip size for price calculations (positive number)
- `enabled` (boolean, optional): Whether instrument is enabled (default: true)

**Response:** `201 Created`

```json
{
  "id": 2,
  "symbol": "GBPUSD",
  "display_name": "British Pound / US Dollar",
  "pip_size": 0.0001,
  "enabled": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `409 Conflict`: Symbol already exists

---

### PUT /instruments/:id

Update an existing instrument.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Instrument ID

**Request Body:**

```json
{
  "display_name": "Euro vs US Dollar",
  "pip_size": 0.00001,
  "enabled": false
}
```

**Request Schema:**

- `display_name` (string, optional): Human-readable name
- `pip_size` (number, optional): Pip size (positive number)
- `enabled` (boolean, optional): Whether instrument is enabled

**Response:** `200 OK`

```json
{
  "id": 1,
  "symbol": "EURUSD",
  "display_name": "Euro vs US Dollar",
  "pip_size": 0.00001,
  "enabled": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-02T10:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Instrument not found

---

### DELETE /instruments/:id

Delete an instrument.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Instrument ID

**Response:** `204 No Content`

**Note:** Cannot delete instruments that have associated datasets or sessions.

**Errors:**

- `400 Bad Request`: Instrument has dependencies
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Instrument not found

---

### POST /instruments/:id/enable

Enable an instrument.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Instrument ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "symbol": "EURUSD",
  "display_name": "Euro / US Dollar",
  "pip_size": 0.0001,
  "enabled": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-02T10:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Instrument not found

---

### POST /instruments/:id/disable

Disable an instrument.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Instrument ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "enabled": false,
  ...
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Instrument not found

---

## Nested Resources

### GET /instruments/:instrumentId/datasets

Get all datasets for a specific instrument.

See [Datasets API - Get Datasets by Instrument](./datasets.md#get-instrumentsinstrument_iddatasets)

---

### GET /instruments/:instrumentId/candles

Get candles for a specific instrument and timeframe.

See [Candles API - Get Candles by Instrument](./candles.md#get-instrumentsinstrument_idcandles)

---
