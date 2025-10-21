# Audit API

## Overview

The Audit API provides access to audit logs tracking user actions and system events for security,
compliance, and troubleshooting purposes.

## Endpoints

### GET /audit/logs

Get a paginated list of audit logs.

**Authentication:** Required (Admin)

**Query Parameters:**

- `start_date` (string, optional): ISO 8601 date
- `end_date` (string, optional): ISO 8601 date
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: created_at)
- `order` (string, optional): Sort order `asc` or `desc` (default: desc)

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "user_id": 1,
    "entity_type": "SESSION",
    "entity_id": "5",
    "audit_action": "CREATE",
    "details": {
      "instrument_id": 1,
      "timeframe": "H1",
      "initial_balance": 10000
    },
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin

---

### GET /audit/logs/:id

Get a specific audit log by ID.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Audit log ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "user_id": 1,
  "entity_type": "SESSION",
  "entity_id": "5",
  "audit_action": "CREATE",
  "details": {
    "instrument_id": 1,
    "timeframe": "H1",
    "initial_balance": 10000
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "created_at": "2024-01-01T10:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Audit log not found

---

### GET /users/:userId/audit-logs

Get audit logs for a specific user.

**Authentication:** Required (User Owner or Admin)

**Path Parameters:**

- `userId` (number, required): User ID

**Query Parameters:** Same as GET /audit/logs

**Response:** `200 OK` (same format as GET /audit/logs)

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the user or admin
- `404 Not Found`: User not found

---

### GET /audit/entities/:entityType/:entityId

Get audit logs for a specific entity.

**Authentication:** Required (Admin or Entity Owner)

**Path Parameters:**

- `entityType` (string, required): Entity type (`USER` | `SESSION` | `TRANSACTION` | `SUBSCRIPTION`
  | `POSITION`)
- `entityId` (string, required): Entity identifier

**Query Parameters:** Same as GET /audit/logs

**Response:** `200 OK` (same format as GET /audit/logs)

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Entity not found

---

## Data Model

### AuditLog Object

```typescript
interface AuditLog {
  id: number; // Unique identifier
  user_id: number; // User who performed the action
  entity_type: EntityType; // Type of entity affected
  entity_id: string; // Entity identifier
  audit_action: AuditAction; // Action performed
  details: Record<string, any>; // Additional action details
  ip_address: string; // IP address of request
  user_agent: string; // User agent string
  created_at: string; // Timestamp (ISO 8601)
}

type EntityType = "USER" | "SESSION" | "TRANSACTION" | "SUBSCRIPTION" | "POSITION";

type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "ROLE_CHANGE"
  | "BAN"
  | "UNBAN";
```

## Audited Actions

### User Actions

- **CREATE**: New user registration
- **UPDATE**: Profile updates
- **DELETE**: Account deletion
- **LOGIN**: Successful login
- **LOGOUT**: User logout
- **PASSWORD_CHANGE**: Password modification
- **ROLE_CHANGE**: Role assignment change
- **BAN**: User banned
- **UNBAN**: User unbanned

### Session Actions

- **CREATE**: New session created
- **UPDATE**: Session modified
- **DELETE**: Session deleted
- **START**: Session started
- **PAUSE**: Session paused
- **RESUME**: Session resumed
- **STOP**: Session stopped
- **ARCHIVE**: Session archived

### Position Actions

- **CREATE**: Position opened
- **UPDATE**: Position modified
- **DELETE**: Position deleted
- **CLOSE**: Position closed
- **LIQUIDATE**: Position liquidated

### Transaction Actions

- **CREATE**: Transaction created
- **DELETE**: Transaction deleted

### Subscription Actions

- **CREATE**: Subscription started
- **UPDATE**: Subscription modified
- **DELETE**: Subscription deleted
- **CANCEL**: Subscription canceled
- **REACTIVATE**: Subscription reactivated

---
