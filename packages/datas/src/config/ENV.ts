import { z } from "zod";

const EnvSchema = z.object({
    DATABASE_URL: z.url(),
    CLICKHOUSE_HOST: z.string().min(1),
    CLICKHOUSE_PORT: z.coerce.number().int().positive(),
    CLICKHOUSE_DB: z.string().min(1),
    CLICKHOUSE_USER: z.string().min(1),
    CLICKHOUSE_PASSWORD: z.string().min(1),
});

export const ENV = EnvSchema.parse(process.env);
