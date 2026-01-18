import { z } from "zod";

/**
 * Validates a string that must be convertible to a number greater than or equal to min.
 * @param min Minimum value (inclusive)
 */
export const numericString = (min: number) =>
    z.string().refine(
        (val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num >= min;
        },
        { message: `Must be a number greater than or equal to ${min}` }
    );

/**
 * Validates a string that must not be empty.
 * @param message Error message
 */
export const requiredString = (message: string) =>
    z.string().min(1, { message });

/**
 * Validates a value that can be a string or a number.
 * Useful for fields that are typed as numbers but rendered in inputs (returning strings).
 */
export const numericOrString = z.union([z.string(), z.number()]);
