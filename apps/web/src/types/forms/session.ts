import { z } from "zod";
import { numericString, requiredString } from "./validation";

/**
 * Session Add form schema
 * Uses string types for all fields to handle HTML form inputs.
 * Validation happens through refinements, not type narrowing.
 */
export const SessionAddFormSchema = z
    .object({
        instrument_id: z.string().min(1, { message: "Instrument is required" }),
        name: z.string().optional(),
        speed: z.string().min(1, { message: "Speed is required" }),
        start_time: requiredString("Start time is required"),
        end_time: z.string().optional(),
        initial_balance: numericString(0.01),
        leverage: z.string().min(1, { message: "Leverage is required" }),
        spread_pts: numericString(0),
        slippage_pts: numericString(0),
        commission_per_fill: numericString(0),
    })
    .refine(
        (data) => {
            if (data.end_time && data.start_time) {
                const start = new Date(data.start_time);
                const end = new Date(data.end_time);
                return end >= start;
            }
            return true;
        },
        {
            message: "End time must be after or equal to start time",
            path: ["end_time"],
        }
    );

export type SessionAddFormState = z.infer<typeof SessionAddFormSchema>;

/**
 * Helper to convert NaN to undefined for optional numeric fields.
 * HTML inputs with valueAsNumber return NaN for empty values.
 */
const nanToUndefined = (val: unknown) =>
    typeof val === "number" && Number.isNaN(val) ? undefined : val;

/**
 * Order form input schema - what the form fields accept.
 * Uses number type directly since we set numeric defaultValues.
 * NaN values (from empty inputs with valueAsNumber) are converted to undefined.
 */
export const OrderFormSchema = z.object({
    qty: z.number().positive({ message: "Quantity must be greater than 0" }),
    tp: z.preprocess(
        nanToUndefined,
        z.number().positive({ message: "TP must be greater than 0" }).optional()
    ),
    sl: z.preprocess(
        nanToUndefined,
        z.number().positive({ message: "SL must be greater than 0" }).optional()
    ),
});

export type OrderFormState = z.infer<typeof OrderFormSchema>;
