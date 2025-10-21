# Authentication API

## Overview

The Authentication API handles user registration, login, logout, password management, and token
refresh operations.

## Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Request Schema:**

- `email` (string, required): Valid email address
- `password` (string, required): Minimum 8 characters
- `confirmPassword` (string, required): Must match password

**Response:** `200 OK`

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "ANONYMOUS",
    "is_banned": false,
    "stripe_customer_id": "cus_xxxxx",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**

- `400 Bad Request`: Invalid input or passwords don't match
- `409 Conflict`: Email already registered

---

### POST /auth/login

Authenticate a user and obtain access tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Request Schema:**

- `email` (string, required): User's email address
- `password` (string, required): User's password (minimum 8 characters)

**Response:** `200 OK`

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "ANONYMOUS",
    "is_banned": false,
    "stripe_customer_id": "cus_xxxxx",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**

- `400 Bad Request`: Invalid credentials
- `401 Unauthorized`: Invalid email or password
- `403 Forbidden`: Account is banned

---

### POST /auth/logout

Logout the current user and invalidate the refresh token.

**Authentication:** Required

**Request Body:** None

**Response:** `204 No Content`

**Errors:**

- `401 Unauthorized`: Invalid or missing token

---

### POST /auth/refresh

Refresh the access token using a valid refresh token.

**Request Headers:**

```
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:** None

**Response:** `200 OK`

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "ANONYMOUS",
    "is_banned": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**

- `401 Unauthorized`: Invalid or expired refresh token

---

### GET /auth/me

Get the current authenticated user's profile.

**Authentication:** Required

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

- `401 Unauthorized`: Invalid or missing token

---

### POST /auth/change-password

Change the current user's password.

**Authentication:** Required

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

**Request Schema:**

- `currentPassword` (string, required): User's current password
- `newPassword` (string, required): New password (minimum 8 characters)
- `confirmPassword` (string, required): Must match newPassword

**Response:** `204 No Content`

**Errors:**

- `400 Bad Request`: Invalid input or passwords don't match
- `401 Unauthorized`: Invalid current password
- `422 Unprocessable Entity`: Validation error

---

### POST /auth/forgot-password

Request a password reset code to be sent via email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Request Schema:**

- `email` (string, required): User's email address

**Response:** `204 No Content`

**Note:** For security reasons, this endpoint always returns success even if the email doesn't
exist.

**Errors:**

- `400 Bad Request`: Invalid email format

---

### POST /auth/reset-password

Reset password using the code received via email.

**Request Body:**

```json
{
  "code": "ABC123XYZ",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

**Request Schema:**

- `code` (string, required): Password reset code from email
- `newPassword` (string, required): New password (minimum 8 characters)
- `confirmPassword` (string, required): Must match newPassword

**Response:** `204 No Content`

**Errors:**

- `400 Bad Request`: Invalid or expired code, or passwords don't match
- `422 Unprocessable Entity`: Validation error

---
