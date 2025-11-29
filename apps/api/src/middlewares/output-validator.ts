import type { z } from "zod";
import { logger } from "../libs/pino";
import { type Request, type Response, type NextFunction } from "express";
import { ErrorResponseSchema } from "@backtrade/types";
import WebError from "../errors/web/web-error";

const outputValidatorLogger = logger.child({
  service: "output-validator",
});

export function responseValidator(schema: z.ZodType<unknown>) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    let isValidating = false; // Flag to prevent re-entry during error handling

    // Override res.json() to validate before sending
    res.json = (body: unknown) => {
      // If we're already in validation (error case), bypass validation to prevent recursion
      if (isValidating) {
        return originalJson(body);
      }

      try {
        // Validate the response body against the schema
        schema.parse(body);
        // If valid, send using the original json method
        // it won't cause recursion
        return originalJson(body);
      } catch (err) {
        let errorCode = 500;
        let errorMessage = "Invalid server response format";

        if (err instanceof WebError) {
          errorCode = err.code;
          errorMessage = err.message;
        }

        // Validation failed - log and send error response
        outputValidatorLogger.error({ errorCode, errorMessage }, "Response schema invalid");

        const errorResponse = ErrorResponseSchema.parse({
          message: errorMessage,
          code: errorCode,
        });
        // Set flag to prevent recursion when sending error response
        isValidating = true;
        res.status(errorCode);
        const result = originalJson(errorResponse);
        isValidating = false;
        return result;
      }
    };

    next();
  };
}
