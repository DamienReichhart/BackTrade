import { z } from "zod";

const EnvSchema = z.object({
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number().int().positive(),
    SMTP_USER: z.string(),
    SMTP_PASSWORD: z.string(),
    SMTP_FROM: z.string(),
    NEUTRALIZE_EMAIL: z
        .string()
        .default("false")
        .transform((val) => val === "true"),
});

export const ENV = EnvSchema.parse(process.env);
