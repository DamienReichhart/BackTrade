# Health API

## Overview

The Health API provides a simple health check endpoint to verify that the API is running and operational. This is useful for monitoring, load balancers, and uptime checks.

## Endpoints

### GET /health

Check the health status of the API.

**Authentication:** None (public endpoint)

**Response:** `200 OK`

```json
{
  "status": "ok",
  "time": "2024-01-01T12:00:00.000Z"
}
```

**Response Schema:**

- `status` (string): Always `"ok"` when API is healthy
- `time` (string): Current server timestamp (ISO 8601)

**Errors:**

- `503 Service Unavailable`: API is unhealthy (database down, etc.)

---
