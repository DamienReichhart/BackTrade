# Support API

## Overview

The Support API manages customer support requests and associated messages, enabling communication between users and support staff.

## Endpoints

### GET /support/requests

Get a paginated list of support requests.

**Authentication:** Required (Own requests or Admin for all)

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
  "support_requests": [
    {
      "id": 1,
      "requester_id": 1,
      "support_status": "OPEN",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated

---

### GET /support/requests/:id

Get a specific support request by ID.

**Authentication:** Required (Requester or Admin)

**Path Parameters:**

- `id` (number, required): Support request ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "requester_id": 1,
  "support_status": "OPEN",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the requester or admin
- `404 Not Found`: Support request not found

---

### POST /support/requests

Create a new support request.

**Authentication:** Required

**Request Body:**

```json
{
  "requester_id": 1,
  "support_status": "OPEN"
}
```

**Request Schema:**

- `requester_id` (number, required): ID of requesting user
- `support_status` (enum, optional): Status (`OPEN` | `CLOSED` | `PENDING_APPROVAL`) - default: `OPEN`

**Response:** `201 Created`

```json
{
  "id": 1,
  "requester_id": 1,
  "support_status": "OPEN",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `422 Unprocessable Entity`: Validation error

---

### PUT /support/requests/:id

Update a support request.

**Authentication:** Required (Requester or Admin)

**Path Parameters:**

- `id` (number, required): Support request ID

**Request Body:**

```json
{
  "support_status": "PENDING_APPROVAL"
}
```

**Request Schema:**

- `requester_id` (number, optional): ID of requesting user
- `support_status` (enum, optional): Status

**Response:** `200 OK`

```json
{
  "id": 1,
  "requester_id": 1,
  "support_status": "PENDING_APPROVAL",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the requester or admin
- `404 Not Found`: Support request not found

---

### DELETE /support/requests/:id

Delete a support request.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Support request ID

**Response:** `204 No Content`

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Support request not found

---

### POST /support/requests/:id/close

Close a support request.

**Authentication:** Required (Requester or Admin)

**Path Parameters:**

- `id` (number, required): Support request ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "requester_id": 1,
  "support_status": "CLOSED",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-02T10:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the requester or admin
- `404 Not Found`: Support request not found

---

## Support Messages

### GET /support/requests/:requestId/messages

Get all messages for a support request.

**Authentication:** Required (Requester or Admin)

**Path Parameters:**

- `requestId` (number, required): Support request ID

**Query Parameters:**

- `start_date` (string, optional): ISO 8601 date
- `end_date` (string, optional): ISO 8601 date
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "sender_id": 1,
    "support_request_id": 1,
    "content": "I'm having trouble with session creation.",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": 2,
    "sender_id": 2,
    "support_request_id": 1,
    "content": "I can help you with that. What error are you seeing?",
    "created_at": "2024-01-01T10:15:00Z",
    "updated_at": "2024-01-01T10:15:00Z"
  }
]
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not involved in the request
- `404 Not Found`: Support request not found

---

### GET /support/messages/:id

Get a specific message by ID.

**Authentication:** Required (Involved in request or Admin)

**Path Parameters:**

- `id` (number, required): Message ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "sender_id": 1,
  "support_request_id": 1,
  "content": "I'm having trouble with session creation.",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not involved in the request
- `404 Not Found`: Message not found

---

### POST /support/messages

Create a new support message.

**Authentication:** Required

**Request Body:**

```json
{
  "sender_id": 1,
  "support_request_id": 1,
  "content": "I'm having trouble with session creation."
}
```

**Request Schema:**

- `sender_id` (number, required): ID of message sender
- `support_request_id` (number, required): Support request ID
- `content` (string, required): Message content (minimum 1 character)

**Response:** `201 Created`

```json
{
  "id": 1,
  "sender_id": 1,
  "support_request_id": 1,
  "content": "I'm having trouble with session creation.",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not involved in the request
- `404 Not Found`: Support request not found
- `422 Unprocessable Entity`: Validation error

---

### PUT /support/messages/:id

Update a support message.

**Authentication:** Required (Sender or Admin)

**Path Parameters:**

- `id` (number, required): Message ID

**Request Body:**

```json
{
  "content": "Updated message content."
}
```

**Request Schema:**

- `sender_id` (number, optional): Sender ID
- `support_request_id` (number, optional): Support request ID
- `content` (string, optional): Message content

**Response:** `200 OK`

```json
{
  "id": 1,
  "content": "Updated message content.",
  ...
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the sender or admin
- `404 Not Found`: Message not found

---

### DELETE /support/messages/:id

Delete a support message.

**Authentication:** Required (Sender or Admin)

**Path Parameters:**

- `id` (number, required): Message ID

**Response:** `204 No Content`

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the sender or admin
- `404 Not Found`: Message not found

---
