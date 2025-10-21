# Subscriptions API

## Overview

The Subscriptions API manages user subscriptions to platform plans, including creating, updating,
canceling, and reactivating subscriptions.

## Endpoints

### GET /subscriptions

Get a list of subscriptions.

**Authentication:** Required (Own subscriptions or Admin for all)

**Query Parameters:**

- `start_date` (string, optional): ISO 8601 date
- `end_date` (string, optional): ISO 8601 date
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: current_period_start)
- `order` (string, optional): Sort order `asc` or `desc` (default: desc)

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "user_id": 1,
    "plan_id": 2,
    "stripe_subscription_id": "sub_xxxxx",
    "status": "active",
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z",
    "cancel_at_period_end": false,
    "canceled_at": null,
    "trial_end": null
  }
]
```

**Errors:**

- `401 Unauthorized`: Not authenticated

---

### GET /subscriptions/:id

Get a specific subscription by ID.

**Authentication:** Required (Subscription Owner or Admin)

**Path Parameters:**

- `id` (number, required): Subscription ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "user_id": 1,
  "plan_id": 2,
  "stripe_subscription_id": "sub_xxxxx",
  "status": "active",
  "current_period_start": "2024-01-01T00:00:00Z",
  "current_period_end": "2024-02-01T00:00:00Z",
  "cancel_at_period_end": false,
  "canceled_at": null,
  "trial_end": null
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the subscription owner or admin
- `404 Not Found`: Subscription not found

---

### GET /users/:userId/subscriptions

Get all subscriptions for a specific user.

**Authentication:** Required (User Owner or Admin)

**Path Parameters:**

- `userId` (number, required): User ID

**Query Parameters:** Same as GET /subscriptions

**Response:** `200 OK` (same format as GET /subscriptions)

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the user or admin
- `404 Not Found`: User not found

---

### POST /subscriptions

Create a new subscription.

**Authentication:** Required

**Request Body:**

```json
{
  "user_id": 1,
  "plan_id": 2,
  "stripe_subscription_id": "sub_xxxxx",
  "status": "trialing",
  "current_period_start": "2024-01-01T00:00:00Z",
  "current_period_end": "2024-02-01T00:00:00Z",
  "cancel_at_period_end": false,
  "trial_end": "2024-01-15T00:00:00Z"
}
```

**Request Schema:**

- `user_id` (number, required): User ID (defaults to current user)
- `plan_id` (number, required): Plan ID
- `stripe_subscription_id` (string, optional): Stripe subscription ID
- `status` (enum, optional): Status (default: "active")
- `current_period_start` (string, required): Period start (ISO 8601)
- `current_period_end` (string, required): Period end (ISO 8601)
- `cancel_at_period_end` (boolean, optional): Cancel at period end (default: false)
- `trial_end` (string, optional): Trial end date (ISO 8601)

**Subscription Status:**

- `active`: Active subscription
- `canceled`: Canceled subscription
- `incomplete`: Payment incomplete
- `incomplete_expired`: Payment expired
- `past_due`: Payment past due
- `trialing`: In trial period
- `unpaid`: Unpaid subscription

**Response:** `201 Created`

```json
{
  "id": 1,
  "user_id": 1,
  "plan_id": 2,
  "stripe_subscription_id": "sub_xxxxx",
  "status": "trialing",
  "current_period_start": "2024-01-01T00:00:00Z",
  "current_period_end": "2024-02-01T00:00:00Z",
  "cancel_at_period_end": false,
  "canceled_at": null,
  "trial_end": "2024-01-15T00:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: User or plan not found
- `409 Conflict`: User already has active subscription
- `422 Unprocessable Entity`: Validation error

---

### PUT /subscriptions/:id

Update an existing subscription.

**Authentication:** Required (Subscription Owner or Admin)

**Path Parameters:**

- `id` (number, required): Subscription ID

**Request Body:**

```json
{
  "plan_id": 3,
  "status": "active",
  "cancel_at_period_end": true
}
```

**Request Schema:**

- `user_id` (number, optional): User ID
- `plan_id` (number, optional): Plan ID
- `stripe_subscription_id` (string, optional): Stripe subscription ID
- `status` (enum, optional): Status
- `current_period_start` (string, optional): Period start
- `current_period_end` (string, optional): Period end
- `cancel_at_period_end` (boolean, optional): Cancel at period end
- `canceled_at` (string, optional): Cancellation timestamp
- `trial_end` (string, optional): Trial end

**Response:** `200 OK`

```json
{
  "id": 1,
  "plan_id": 3,
  "status": "active",
  "cancel_at_period_end": true,
  ...
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the subscription owner or admin
- `404 Not Found`: Subscription not found

---

### DELETE /subscriptions/:id

Delete a subscription immediately.

**Authentication:** Required (Subscription Owner or Admin)

**Path Parameters:**

- `id` (number, required): Subscription ID

**Response:** `204 No Content`

**Note:** This immediately cancels and deletes the subscription. Use cancel endpoint for graceful
cancellation.

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the subscription owner or admin
- `404 Not Found`: Subscription not found

---

### POST /subscriptions/:id/cancel

Cancel a subscription at the end of the billing period.

**Authentication:** Required (Subscription Owner or Admin)

**Path Parameters:**

- `id` (number, required): Subscription ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "user_id": 1,
  "plan_id": 2,
  "stripe_subscription_id": "sub_xxxxx",
  "status": "active",
  "current_period_start": "2024-01-01T00:00:00Z",
  "current_period_end": "2024-02-01T00:00:00Z",
  "cancel_at_period_end": true,
  "canceled_at": "2024-01-15T10:00:00Z",
  "trial_end": null
}
```

**Note:** Subscription remains active until `current_period_end`, then status changes to `canceled`.

**Errors:**

- `400 Bad Request`: Subscription already canceled
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the subscription owner or admin
- `404 Not Found`: Subscription not found

---

### POST /subscriptions/:id/reactivate

Reactivate a canceled subscription before it expires.

**Authentication:** Required (Subscription Owner or Admin)

**Path Parameters:**

- `id` (number, required): Subscription ID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "status": "active",
  "cancel_at_period_end": false,
  "canceled_at": null,
  ...
}
```

**Note:** Only works if subscription hasn't expired yet (`current_period_end` not reached).

**Errors:**

- `400 Bad Request`: Subscription has already expired
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the subscription owner or admin
- `404 Not Found`: Subscription not found

---
