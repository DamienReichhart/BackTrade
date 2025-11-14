# REST API Specifications

**Base URL :** https://backtrade.damien-reichhart.fr/api  
**Format :** JSON  
**Authentication :** JWT (JSON Web Token)

## Required Headers

### For all requests :

```http
Content-Type: application/json
```

### For protected routes :

```http
Authorization: Bearer {token}
```

### For requests with file upload :

```http
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

## CORS

The server must allow requests from the Angular frontend running on https://backtrade.damien-reichhart.fr.

Required CORS configuration :

- Origin : https://backtrade.damien-reichhart.fr
- Methods : GET, POST, PUT, DELETE, PATCH
- Headers : Origin, X-Requested-With, Content-Type, Accept, Authorization

## Authentication

The API uses JWT tokens to secure endpoints.

### JWT Token Format

The token contains the following information :

```json
{
  "sub": {
    "id": 1,
    "email": "admin@backtrade.com",
    "role": "ADMIN",
    "is_banned": false,
    "stripe_customer_id": "cus_admin123",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "iat": 123456,
  "exp": 123456
}
```

**Validity duration :** 1 hour

### Token Usage

The token must be included in the Authorization header with the Bearer prefix :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Renewal

The token is not automatically renewable or Refresh token

## HTTP Codes

| Code    | Status                | When to use                                    |
| ------- | --------------------- | ---------------------------------------------- |
| **200** | OK                    | Request successful                             |
| **201** | Created               | Resource created successfully                  |
| **400** | Bad Request           | Malformed request or invalid data              |
| **401** | Unauthorized          | Authentication required or invalid token       |
| **403** | Forbidden             | Access denied (user is not the resource owner) |
| **404** | Not Found             | Resource not found                             |
| **409** | Conflict              | Conflict (e.g., email already used)            |
| **500** | Internal Server Error | Server error                                   |

## Error Format

```json
{
  "error": {
    "message": "Error description"
  }
}
```

| Verb | Endpoint | Request body | Response type | Status codes | Function |
| ---- | -------- | ------------ | ------------- | ------------ | -------- |

## API Routes

### Authentication and authorization

All routes related to resources must be protected by authorization.
The authentication token is transmitted by the front-end in the HTTP header :

```markdown
Authorization: Bearer <token>
```

Before any modification or deletion of a resource, the server must verify that the identifier of the currently authenticated user matches the identifier of the resource owner.
If the identifiers do not match, the request must be rejected with a response :

```json
{
  "error": {
    "message": "You are not authorized to modify this resource"
  }
}
```

**HTTP Code :** 403 Forbidden

This verification ensures that only the legitimate owner of a resource is authorized to modify or delete it.

### Public Routes

### Protected Routes

### Routes with ownership verification

The following routes require that the user be the creator of the resource in question :

**Version :** 1.0.0  
**Date :** 13 november 2025

test
