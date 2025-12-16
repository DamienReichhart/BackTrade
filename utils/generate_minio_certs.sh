#!/bin/bash

# Script to generate self-signed SSL certificates for MinIO
# Usage: ./utils/generate_minio_certs.sh

set -e

CERT_DIR="docker/config/minio/certs"
PUBLIC_CERT="${CERT_DIR}/public.crt"
PRIVATE_KEY="${CERT_DIR}/private.key"

# Create certs directory if it doesn't exist
mkdir -p "${CERT_DIR}"

# Check if certificates already exist
if [ -f "${PUBLIC_CERT}" ] && [ -f "${PRIVATE_KEY}" ]; then
    echo "Certificates already exist at ${CERT_DIR}"
    echo "Delete them first if you want to regenerate."
    exit 0
fi

# Generate self-signed certificate
# MinIO requires the certificate to have specific SAN (Subject Alternative Names)
# We'll use localhost and the IP address for development
openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=minio" \
    -addext "subjectAltName=DNS:localhost,DNS:minio,IP:127.0.0.1,IP:192.168.250.23" \
    -keyout "${PRIVATE_KEY}" \
    -out "${PUBLIC_CERT}"

# Set appropriate permissions
chmod 600 "${PRIVATE_KEY}"
chmod 644 "${PUBLIC_CERT}"

echo "MinIO SSL certificates generated successfully!"
echo "Public certificate: ${PUBLIC_CERT}"
echo "Private key: ${PRIVATE_KEY}"
echo ""
echo "Note: These are self-signed certificates for development only."
echo "For production, use certificates from a trusted CA."

