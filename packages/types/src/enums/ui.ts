import { z } from "zod";

/**
 * Button component variants
 */
export const ButtonVariantSchema = z.enum([
    "primary",
    "secondary",
    "outline",
    "ghost",
]);
export type ButtonVariant = z.infer<typeof ButtonVariantSchema>;

/**
 * Button component sizes
 */
export const ButtonSizeSchema = z.enum(["small", "medium", "large"]);
export type ButtonSize = z.infer<typeof ButtonSizeSchema>;

/**
 * Badge variants for pricing tiers and other UI elements
 */
export const BadgeVariantSchema = z.enum(["default", "popular", "premium"]);
export type BadgeVariant = z.infer<typeof BadgeVariantSchema>;

/**
 * StatCard component variants
 */
export const StatCardVariantSchema = z.enum(["default", "highlight", "large"]);
export type StatCardVariant = z.infer<typeof StatCardVariantSchema>;

/**
 * Value color types for displaying positive/negative values
 */
export const ValueColorSchema = z.enum(["default", "positive", "negative"]);
export type ValueColor = z.infer<typeof ValueColorSchema>;
