import * as Minio from "minio";
import type { Readable } from "stream";
import { ENV } from "../config/env";
import { logger } from "./logger/pino";

const minioLogger = logger.child({
    service: "minio",
});

const minioClient = new Minio.Client({
    endPoint: ENV.MINIO_HOST,
    port: ENV.MINIO_PORT,
    useSSL: true,
    accessKey: ENV.MINIO_USER,
    secretKey: ENV.MINIO_PASSWORD,
});

minioClient.setRequestOptions({
    rejectUnauthorized: false,
});
minioLogger.warn(
    "Configured MinIO client to accept self-signed certificates for development"
);

minioLogger.info(
    {
        host: ENV.MINIO_HOST,
        port: ENV.MINIO_PORT,
        useSSL: true,
    },
    "Minio client created"
);

const doesBucketExist = async (bucketName: string) => {
    try {
        const exists = await minioClient.bucketExists(bucketName);
        return exists;
    } catch (error) {
        minioLogger.error(error, "Error checking if bucket exists");
        return false;
    }
};

const makeBucket = async (bucketName: string) => {
    try {
        await minioClient.makeBucket(bucketName);
    } catch (error) {
        minioLogger.error(error, "Error making bucket");
        throw error;
    }
};

const uploadFile = async (
    bucketName: string,
    fileName: string,
    file: Buffer
) => {
    try {
        await minioClient.putObject(bucketName, fileName, file);
    } catch (error) {
        minioLogger.error(error, "Error uploading file");
        throw error;
    }
};

const downloadFile = async (
    bucketName: string,
    fileName: string
): Promise<Buffer> => {
    try {
        const stream = await minioClient.getObject(bucketName, fileName);
        return await streamToBuffer(await stream);
    } catch (error) {
        minioLogger.error(error, "Error downloading file");
        throw error;
    }
};

const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
        stream.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
        });

        stream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        stream.on("error", (error: Error) => {
            reject(error);
        });
    });
};

export { doesBucketExist, makeBucket, uploadFile, downloadFile };
