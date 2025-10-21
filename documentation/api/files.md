# Files API

## Overview

The Files API manages file uploads, downloads, and metadata for datasets, reports, and support
attachments.

## Endpoints

### GET /files

Get a paginated list of files.

**Authentication:** Required

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: uploaded_at)
- `order` (string, optional): Sort order `asc` or `desc` (default: desc)

**Response:** `200 OK`

```json
{
  "files": [
    {
      "id": 1,
      "owner_id": 1,
      "entity_id": "dataset_1",
      "path": "/uploads/2024/01/data.csv",
      "size": "2.5MB",
      "md5": "5d41402abc4b2a76b9719d911017c592",
      "uploaded_at": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated

---

### GET /files/:id

Get a specific file's metadata by ID.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): File ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "owner_id": 1,
  "entity_id": "dataset_1",
  "path": "/uploads/2024/01/data.csv",
  "size": "2.5MB",
  "md5": "5d41402abc4b2a76b9719d911017c592",
  "uploaded_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: File not found

---

### GET /entities/:entityId/files

Get all files associated with a specific entity.

**Authentication:** Required

**Path Parameters:**

- `entityId` (string, required): Entity identifier (e.g., "dataset_1", "report_5")

**Query Parameters:** Same as GET /files

**Response:** `200 OK` (same format as GET /files)

**Errors:**

- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Entity not found

---

### POST /files

Create a file metadata record.

**Authentication:** Required

**Request Body:**

```json
{
  "owner_id": 1,
  "entity_id": "dataset_1",
  "path": "/uploads/2024/01/data.csv",
  "size": "2.5MB",
  "md5": "5d41402abc4b2a76b9719d911017c592"
}
```

**Request Schema:**

- `owner_id` (number, required): User ID of file owner
- `entity_id` (string, required): Associated entity identifier
- `path` (string, required): File storage path
- `size` (string, required): File size (human-readable)
- `md5` (string, required): MD5 hash for integrity verification

**Response:** `201 Created`

```json
{
  "id": 1,
  "owner_id": 1,
  "entity_id": "dataset_1",
  "path": "/uploads/2024/01/data.csv",
  "size": "2.5MB",
  "md5": "5d41402abc4b2a76b9719d911017c592",
  "uploaded_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `422 Unprocessable Entity`: Validation error

---

### PUT /files/:id

Update file metadata.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): File ID

**Request Body:**

```json
{
  "entity_id": "dataset_2",
  "path": "/uploads/2024/01/data_updated.csv"
}
```

**Request Schema:**

- `owner_id` (number, optional): Owner ID
- `entity_id` (string, optional): Entity ID
- `path` (string, optional): Storage path
- `size` (string, optional): File size
- `md5` (string, optional): MD5 hash

**Response:** `200 OK`

```json
{
  "id": 1,
  "entity_id": "dataset_2",
  "path": "/uploads/2024/01/data_updated.csv",
  ...
}
```

**Errors:**

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: File not found

---

### DELETE /files/:id

Delete a file.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): File ID

**Response:** `204 No Content`

**Note:** This deletes both the file record and the physical file from storage.

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: File not found

---

### POST /files/upload

Upload a new file.

**Authentication:** Required

**Request Body:** `multipart/form-data`

**Form Fields:**

- `file` (file, required): The file to upload
- `entity_id` (string, optional): Associated entity identifier

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "filename": "data.csv",
    "size": "2.5MB",
    "url": "https://api.backtrade.com/api/v1/files/1/download"
  }
}
```

**Errors:**

- `400 Bad Request`: No file provided or invalid file
- `401 Unauthorized`: Not authenticated
- `413 Payload Too Large`: File exceeds size limit
- `415 Unsupported Media Type`: File type not allowed

---

### GET /files/:id/download

Download a file.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**

- `id` (number, required): File ID

**Response:** `200 OK`

```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="data.csv"
Content-Length: 2621440

[file content]
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the owner or admin
- `404 Not Found`: File not found
- `500 Internal Server Error`: File storage error

---
