import { z } from "zod";

const EnvSchema = z.object({
    MINIO_HOST: z.string(),
    MINIO_PORT: z.coerce.number().int().positive(),
    MINIO_USER: z.string(),
    MINIO_PASSWORD: z.string(),
    MINIO_CA_CERT_PATH: z.string().optional(),
    MINIO_USE_SSL: z
        .string()
        .optional()
        .default("false")
        .transform((val) => {
            // Default to false if not provided (SSL disabled by default)
            if (val === undefined || val === "") {
                return false;
            }
            return val === "true";
        }),
});

export const ENV = EnvSchema.parse(process.env);
