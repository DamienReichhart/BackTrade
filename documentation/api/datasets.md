# Datasets API

## Overview

The Datasets API manages historical market data collections used for backtesting sessions. Each
dataset contains candlestick data for a specific instrument and timeframe.

## Endpoints

### GET /datasets

Get a paginated list of datasets with optional date range filtering.

**Authentication:** Required

**Query Parameters:**

- `start_date` (string, optional): ISO 8601 date (filter datasets after this date)
- `end_date` (string, optional): ISO 8601 date (filter datasets before this date)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: created_at)
- `order` (string, optional): Sort order `asc` or `desc` (default: desc)

**Response:** `200 OK`

```json
{
  "datasets": [
    {
      "id": 1,
      "instrument_id": 1,
      "timeframe": "H1",
      "uploaded_by_user_id": 1,
      "uploaded_at": "2024-01-01T00:00:00Z",
      "records_count": 8760,
      "file_id": 10,
      "is_active": true,
      "start_ts": "2023-01-01T00:00:00Z",
      "end_ts": "2023-12-31T23:59:59Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 20
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated

---

### GET /datasets/:id

Get a specific dataset by ID.

**Authentication:** Required

**Path Parameters:**

- `id` (number, required): Dataset ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "instrument_id": 1,
  "timeframe": "H1",
  "uploaded_by_user_id": 1,
  "uploaded_at": "2024-01-01T00:00:00Z",
  "records_count": 8760,
  "file_id": 10,
  "is_active": true,
  "start_ts": "2023-01-01T00:00:00Z",
  "end_ts": "2023-12-31T23:59:59Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Dataset not found

---

### GET /instruments/:instrumentId/datasets

Get all datasets for a specific instrument.

**Authentication:** Required

**Path Parameters:**

- `instrumentId` (number, required): Instrument ID

**Query Parameters:** Same as GET /datasets

**Response:** `200 OK` (same format as GET /datasets)

**Errors:**

- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Instrument not found

---

### POST /datasets

Create a new dataset.

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "instrument_id": 1,
  "timeframe": "H1",
  "file_id": 10,
  "start_ts": "2023-01-01T00:00:00Z",
  "end_ts": "2023-12-31T23:59:59Z"
}
```

**Request Schema:**

- `instrument_id` (number, required): Instrument ID
- `timeframe` (enum, required): Timeframe (`M1` | `M5` | `M10` | `M15` | `M30` | `H1` | `H2` | `H4`
  | `D1` | `W1`)
- `file_id` (number, required): ID of uploaded data file
- `start_ts` (string, required): Dataset start timestamp (ISO 8601)
- `end_ts` (string, required): Dataset end timestamp (ISO 8601)

**Response:** `201 Created`

```json
{
  "id": 1,
  "instrument_id": 1,
  "timeframe": "H1",
  "uploaded_by_user_id": 1,
  "uploaded_at": "2024-01-01T00:00:00Z",
  "records_count": 0,
  "file_id": 10,
  "is_active": true,
  "start_ts": "2023-01-01T00:00:00Z",
  "end_ts": "2023-12-31T23:59:59Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Instrument or file not found
- `422 Unprocessable Entity`: Validation error

---

### PUT /datasets/:id

Update an existing dataset.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Dataset ID

**Request Body:**

```json
{
  "is_active": false
}
```

**Request Schema:**

- `instrument_id` (number, optional): Instrument ID
- `timeframe` (enum, optional): Timeframe
- `file_id` (number, optional): File ID
- `start_ts` (string, optional): Start timestamp
- `end_ts` (string, optional): End timestamp

**Response:** `200 OK`

```json
{
  "id": 1,
  "is_active": false,
  ...
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Dataset not found

---

### DELETE /datasets/:id

Delete a dataset.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Dataset ID

**Response:** `204 No Content`

**Note:** Cannot delete datasets that are being used by active sessions.

**Errors:**

- `400 Bad Request`: Dataset in use
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Dataset not found

---

### POST /datasets/:id/activate

Activate a dataset (make it available for use).

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Dataset ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "is_active": true,
  ...
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Dataset not found

---

### POST /datasets/:id/deactivate

Deactivate a dataset (make it unavailable for new sessions).

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Dataset ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "is_active": false,
  ...
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Dataset not found

---
