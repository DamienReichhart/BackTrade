# Plans API

## Overview

The Plans API manages subscription plans available for users to purchase. Plans define pricing tiers
and features for the platform.

## Endpoints

### GET /plans

Get a list of available subscription plans.

**Authentication:** Optional (public endpoint, but authenticated users see more details)

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: id)
- `order` (string, optional): Sort order `asc` or `desc` (default: asc)

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "code": "FREE",
    "stripe_product_id": "prod_xxxxx",
    "stripe_price_id": "price_xxxxx",
    "currency": "USD"
  },
  {
    "id": 2,
    "code": "PRO",
    "stripe_product_id": "prod_yyyyy",
    "stripe_price_id": "price_yyyyy",
    "currency": "USD"
  },
  {
    "id": 3,
    "code": "ENTERPRISE",
    "stripe_product_id": "prod_zzzzz",
    "stripe_price_id": "price_zzzzz",
    "currency": "USD"
  }
]
```

**Errors:**

- None (public endpoint)

---

### GET /plans/:id

Get a specific plan by ID.

**Authentication:** Optional (public endpoint)

**Path Parameters:**

- `id` (number, required): Plan ID

**Response:** `200 OK`

```json
{
  "id": 2,
  "code": "PRO",
  "stripe_product_id": "prod_yyyyy",
  "stripe_price_id": "price_yyyyy",
  "currency": "USD"
}
```

**Errors:**

- `404 Not Found`: Plan not found

---

### POST /plans

Create a new subscription plan.

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "code": "PREMIUM",
  "stripe_product_id": "prod_xxxxx",
  "stripe_price_id": "price_xxxxx",
  "currency": "USD"
}
```

**Request Schema:**

- `code` (string, required): Plan code identifier (e.g., "FREE", "PRO", "ENTERPRISE")
- `stripe_product_id` (string, required): Stripe product ID
- `stripe_price_id` (string, required): Stripe price ID
- `currency` (string, required): 3-letter ISO currency code (e.g., "USD", "EUR")

**Response:** `201 Created`

```json
{
  "id": 4,
  "code": "PREMIUM",
  "stripe_product_id": "prod_xxxxx",
  "stripe_price_id": "price_xxxxx",
  "currency": "USD"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `409 Conflict`: Plan code already exists
- `422 Unprocessable Entity`: Validation error

---

### PUT /plans/:id

Update an existing plan.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Plan ID

**Request Body:**

```json
{
  "code": "PRO_PLUS",
  "stripe_price_id": "price_new_xxxxx"
}
```

**Request Schema:**

- `code` (string, optional): Plan code
- `stripe_product_id` (string, optional): Stripe product ID
- `stripe_price_id` (string, optional): Stripe price ID
- `currency` (string, optional): ISO currency code

**Response:** `200 OK`

```json
{
  "id": 2,
  "code": "PRO_PLUS",
  "stripe_product_id": "prod_yyyyy",
  "stripe_price_id": "price_new_xxxxx",
  "currency": "USD"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Plan not found
- `409 Conflict`: Plan code already exists

---

### DELETE /plans/:id

Delete a subscription plan.

**Authentication:** Required (Admin)

**Path Parameters:**

- `id` (number, required): Plan ID

**Response:** `204 No Content`

**Note:** Cannot delete plans with active subscriptions.

**Errors:**

- `400 Bad Request`: Plan has active subscriptions
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin
- `404 Not Found`: Plan not found

---
