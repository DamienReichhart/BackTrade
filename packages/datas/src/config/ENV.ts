import { z } from "zod";

const EnvSchema = z.object({
    DATABASE_URL: z.url(),
});

export const ENV = EnvSchema.parse(process.env);
