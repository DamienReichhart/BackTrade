FROM minio/minio:latest

CMD ["minio", "server", "/data", "--console-address", ":9001"]