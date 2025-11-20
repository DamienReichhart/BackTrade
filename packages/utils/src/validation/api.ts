import type { z } from "zod";

/**
 * Validate API input using Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param input - Input data to validate
 * @returns Validated input data
 * @throws Error if validation fails
 */
export function validateApiInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(`Input validation failed: ${result.error.message}`);
  }
  return result.data;
}

/**
 * Validate API output using Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param output - Output data to validate
 * @returns Validated output data
 * @throws Error if validation fails
 */
export function validateApiOutput<T>(schema: z.ZodType<T>, output: unknown): T {
  const result = schema.safeParse(output);
  if (!result.success) {
    throw new Error(`Output validation failed: ${result.error.message}`);
  }
  return result.data;
}
