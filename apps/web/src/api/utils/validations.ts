import { z } from "zod";


export function validateApiInput<T>(schema: z.ZodType<T>, input: unknown): T {
    const result = schema.safeParse(input);
    if (!result.success) {
        throw new Error(`Input validation failed: ${result.error.message}`);
    }
    return result.data;
}


export function validateApiOutput<T>(schema: z.ZodType<T>, output: unknown): T {
    const result = schema.safeParse(output);
    if (!result.success) {
        throw new Error(`Output validation failed: ${result.error.message}`);
    }
    return result.data;
}