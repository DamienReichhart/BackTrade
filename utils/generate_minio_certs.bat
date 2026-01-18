@echo off
REM Script to generate self-signed SSL certificates for MinIO (Windows)
REM Usage: utils\generate_minio_certs.bat

set CERT_DIR=docker\config\minio\certs
set PUBLIC_CERT=%CERT_DIR%\public.crt
set PRIVATE_KEY=%CERT_DIR%\private.key

REM Create certs directory if it doesn't exist
if not exist "%CERT_DIR%" mkdir "%CERT_DIR%"

REM Check if certificates already exist
if exist "%PUBLIC_CERT%" if exist "%PRIVATE_KEY%" (
    echo Certificates already exist at %CERT_DIR%
    echo Delete them first if you want to regenerate.
    exit /b 0
)

REM Generate self-signed certificate
REM MinIO requires the certificate to have specific SAN (Subject Alternative Names)
REM We'll use localhost and the IP address for development
openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 ^
    -subj "/C=US/ST=State/L=City/O=Organization/CN=minio" ^
    -addext "subjectAltName=DNS:localhost,DNS:minio,IP:127.0.0.1,IP:192.168.250.23" ^
    -keyout "%PRIVATE_KEY%" ^
    -out "%PUBLIC_CERT%"

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to generate certificates. Make sure OpenSSL is installed.
    echo You can download OpenSSL from: https://slproweb.com/products/Win32OpenSSL.html
    exit /b 1
)

echo MinIO SSL certificates generated successfully!
echo Public certificate: %PUBLIC_CERT%
echo Private key: %PRIVATE_KEY%
echo.
echo Note: These are self-signed certificates for development only.
echo For production, use certificates from a trusted CA.

