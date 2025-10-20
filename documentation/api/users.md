# Users API

## Overview

The Users API provides endpoints for user management, including creating, updating, deleting users, and managing user bans. Admin access is required for most operations.

## Endpoints

### GET /users

Get a paginated list of users with optional search.

**Authentication:** Required (Admin)

**Query Parameters:**

- `q` (string, optional): Search query for filtering users
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: created_at)
- `order` (string, optional): Sort order `asc` or `desc` (default: desc)

**Response:** `200 OK`

```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "ANONYMOUS",
      "is_banned": false,
      "stripe_customer_id": "cus_xxxxx",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions (not admin)

---

### GET /users/:id

Get a specific user by ID.

**Authentication:** Required (Admin or own user)

**Path Parameters:**

- `id` (number, required): User ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "ANONYMOUS",
  "is_banned": false,
  "stripe_customer_id": "cus_xxxxx",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

---

### POST /users

Create a new user.

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "role": "ANONYMOUS",
  "is_banned": false
}
```

**Request Schema:**

- `email` (string, required): Valid email address
- `role` (enum, optional): User role (`ANONYMOUS` | `ADMIN`)
- `is_banned` (boolean, optional): Ban status

**Response:** `201 Created`

```json
{
  "id": 2,
  "email": "newuser@example.com",
  "role": "ANONYMOUS",
  "is_banned": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `409 Conflict`: Email already exists

---

### PUT /users/:id

Update an existing user.

**Authentication:** Required (Admin or own user)

**Path Parameters:**

- `id` (number, required): User ID

**Request Body:**

```json
{
  "email": "updated@example.com",
  "role": "ADMIN",
  "is_banned": false
}
```

**Request Schema:**

- `email` (string, optional): Valid email address
- `role` (enum, optional): User role (`ANONYMOUS` | `ADMIN`)
- `is_banned` (boolean, optional): Ban status

**Response:** `200 OK`

```json
{
  "id": 1,
  "email": "updated@example.com",
  "role": "ADMIN",
  "is_banned": false,
  "stripe_customer_id": "cus_xxxxx",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found
- `409 Conflict`: Email already exists

---

### DELETE /users/:id

Delete a user.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): User ID

**Response:** `204 No Content`

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

---

### POST /users/:id/ban

Ban a user account.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): User ID

**Request Body:** None

**Response:** `204 No Content`

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

---

### POST /users/:id/unban

Unban a user account.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): User ID

**Request Body:** None

**Response:** `204 No Content`

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

---

## Nested Resources

### GET /users/:userId/transactions

Get all transactions for a specific user.

See [Transactions API - Get Transactions by User](./transactions.md#get-usersuser_idtransactions)

---

### GET /users/:userId/subscriptions

Get all subscriptions for a specific user.

See [Subscriptions API - Get Subscriptions by User](./subscriptions.md#get-usersuser_idsubscriptions)

---

### GET /users/:userId/audit-logs

Get audit logs for a specific user.

See [Audit API - Get Audit Logs by User](./audit.md#get-usersuser_idaudit-logs)

---
