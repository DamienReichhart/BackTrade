FROM quay.io/minio/aistor/minio:latest

ENV MINIO_CONFIG_ENV_FILE="/mnt/minio/config"

CMD ["minio", "server"]