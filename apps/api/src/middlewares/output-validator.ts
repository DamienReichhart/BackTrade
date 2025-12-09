import type { z } from "zod";
import { logger } from "../libs/logger/pino";
import { type Request, type Response, type NextFunction } from "express";
import OutputValidationError from "../errors/web/output-validation-error";
import { formatZodError } from "@backtrade/utils";

const outputValidatorLogger = logger.child({
    service: "output-validator",
});

export function responseValidator(schema: z.ZodType<unknown>) {
    return (_req: Request, res: Response, next: NextFunction) => {
        const originalJson = res.json.bind(res);

        // Override res.json() to validate before sending
        res.json = (body: unknown) => {
            // Skip validation for error responses (they have their own schema)
            if (
                typeof body === "object" &&
                body !== null &&
                ("error" in body || ("code" in body && "message" in body))
            ) {
                return originalJson(body);
            }

            try {
                // Validate the response body against the schema
                schema.parse(body);
                // If valid, send using the original json method
                return originalJson(body);
            } catch (err) {
                // Validation failed - log the error
                outputValidatorLogger.error(
                    { validationError: err, responseBody: body },
                    "Response schema validation failed"
                );

                // Format Zod errors properly, fallback to generic error message
                const errorMessage =
                    err instanceof z.ZodError
                        ? formatZodError(err)
                        : (err as Error).message.replace(/\n/g, " ").trim();

                throw new OutputValidationError(
                    `Invalid server response format: ${errorMessage}`
                );
            }
        };

        next();
    };
}
