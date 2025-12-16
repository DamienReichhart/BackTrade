MinIO SSL Configuration

MinIO is configured to run with SSL/TLS encryption. This directory contains the SSL certificates required for secure communication.

## Certificate Files

MinIO expects the following certificate files in this directory:

- `public.crt` - Public SSL certificate
- `private.key` - Private SSL key

## Generating Certificates

### Development (Self-Signed Certificates)

For development environments, you can generate self-signed certificates using the provided scripts:

**Linux/macOS:**

```bash
./utils/generate_minio_certs.sh
```

**Windows:**

```bash
utils\generate_minio_certs.bat
```

**Note:** You need OpenSSL installed on your system to run these scripts.

### Production (Trusted CA Certificates)

For production environments, you should use certificates from a trusted Certificate Authority (CA). Place your certificates in this directory with the names:

- `public.crt`
- `private.key`

## How It Works

The certificates are mounted into the MinIO container at `/root/.minio/certs/`. MinIO automatically detects the presence of these certificates and enables SSL/TLS on port 9000.

When certificates are present:

- MinIO API (port 9000) will use HTTPS
- MinIO Console (port 9001) will use HTTPS

## Client Configuration

### Self-Signed Certificates (Development)

If you're using self-signed certificates, you need to configure the Node.js application to trust them. You can do this by setting the `MINIO_CA_CERT_PATH` environment variable to point to your certificate file.

**When running in Docker (recommended):**

```bash
MINIO_CA_CERT_PATH=/app/docker/config/minio/certs/public.crt
```

**When running locally:**

```bash
MINIO_CA_CERT_PATH=./docker/config/minio/certs/public.crt
```

Alternatively, you can use the `NODE_EXTRA_CA_CERTS` environment variable:

```bash
# Docker
NODE_EXTRA_CA_CERTS=/app/docker/config/minio/certs/public.crt

# Local
NODE_EXTRA_CA_CERTS=./docker/config/minio/certs/public.crt
```

**Note:** The code will automatically try to resolve the path from multiple locations, so relative paths should work in most cases. However, using absolute paths is more reliable.

### Production Certificates

For production certificates from a trusted CA, no additional configuration is needed. The Node.js runtime will automatically trust certificates from standard CAs.

## Security Notes

- Certificate files are excluded from git (see `.gitignore`)
- Private keys should have restricted permissions (600)
- Never commit private keys or certificates to version control
- For production, use certificates from a trusted CA or your organization's PKI
- Self-signed certificates should only be used in development environments
