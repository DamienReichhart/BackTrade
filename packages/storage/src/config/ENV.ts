import { z } from "zod";

const EnvSchema = z.object({
    S3_HOST: z.string(),
    S3_PORT: z.coerce.number().int().positive(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_REGION: z.string().default("us-east-1"),
});

export const ENV = EnvSchema.parse(process.env);
