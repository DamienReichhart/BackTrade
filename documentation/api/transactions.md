# Transactions API

## Overview

The Transactions API provides access to financial transaction history, including deposits, withdrawals, commissions, P&L, and other balance adjustments.

## Endpoints

### GET /transactions

Get a paginated list of transactions with optional date range filtering.

**Authentication:** Required

**Query Parameters:**

- `start_date` (string, optional): ISO 8601 date (filter transactions after this date)
- `end_date` (string, optional): ISO 8601 date (filter transactions before this date)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: created_at)
- `order` (string, optional): Sort order `asc` or `desc` (default: desc)

**Response:** `200 OK`

```json
{
  "transactions": [
    {
      "id": 1,
      "user_id": 1,
      "session_id": 1,
      "position_id": 10,
      "transaction_type": "PNL",
      "amount": 46.0,
      "balance_after": 10046.0,
      "created_at": "2024-01-01T14:00:00Z",
      "updated_at": "2024-01-01T14:00:00Z"
    }
  ],
  "total": 250,
  "page": 1,
  "limit": 20
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated

---

### GET /transactions/:id

Get a specific transaction by ID.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): Transaction ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "user_id": 1,
  "session_id": 1,
  "position_id": 10,
  "transaction_type": "PNL",
  "amount": 46.0,
  "balance_after": 10046.0,
  "created_at": "2024-01-01T14:00:00Z",
  "updated_at": "2024-01-01T14:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: Transaction not found

---

### GET /users/:userId/transactions

Get all transactions for a specific user.

**Authentication:** Required (User Owner or Admin)

**Path Parameters:**

- `userId` (number, required): User ID

**Query Parameters:** Same as GET /transactions

**Response:** `200 OK` (same format as GET /transactions)

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the user or admin
- `404 Not Found`: User not found

---

### GET /sessions/:sessionId/transactions

Get all transactions for a specific session.

**Authentication:** Required (Session Owner or Admin)

**Path Parameters:**

- `sessionId` (number, required): Session ID

**Query Parameters:** Same as GET /transactions

**Response:** `200 OK` (same format as GET /transactions)

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the session owner or admin
- `404 Not Found`: Session not found

---

### POST /transactions

Create a new transaction (manual adjustment).

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "user_id": 1,
  "session_id": 1,
  "position_id": 10,
  "transaction_type": "ADJUSTMENT",
  "amount": 100.0,
  "balance_after": 10100.0
}
```

**Request Schema:**

- `user_id` (number, required): User ID
- `session_id` (number, optional): Session ID (if related to a session)
- `position_id` (number, optional): Position ID (if related to a position)
- `transaction_type` (enum, required): Transaction type
- `amount` (number, required): Transaction amount (can be negative)
- `balance_after` (number, required): Balance after transaction

**Transaction Types:**

- `DEPOSIT`: Funds added to account
- `WITHDRAWAL`: Funds removed from account
- `COMMISSION`: Trading commission charged
- `PNL`: Profit or loss from position
- `SLIPPAGE`: Slippage cost
- `SPREAD`: Spread cost
- `ADJUSTMENT`: Manual balance adjustment

**Response:** `201 Created`

```json
{
  "id": 1,
  "user_id": 1,
  "session_id": 1,
  "position_id": 10,
  "transaction_type": "ADJUSTMENT",
  "amount": 100.0,
  "balance_after": 10100.0,
  "created_at": "2024-01-01T14:00:00Z",
  "updated_at": "2024-01-01T14:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `422 Unprocessable Entity`: Validation error

---

### DELETE /transactions/:id

Delete a transaction (admin only).

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Transaction ID

**Response:** `204 No Content`

**Note:** Deleting a transaction does not automatically adjust balances. This should be used carefully for data correction only.

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Transaction not found

---
