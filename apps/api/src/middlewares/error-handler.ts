import { logger } from "../libs/logger/pino";
import type { Request, Response, NextFunction } from "express";
import { ErrorResponseSchema } from "@backtrade/types";
import WebError from "../errors/web/web-error";
import { sanitizeForJson } from "@backtrade/utils";

const errorHandlerLogger = logger.child({
    service: "error-handler",
});

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    errorHandlerLogger.error({ err, req }, "New error caught by error handler");

    let errorCode = 500;
    let errorMessage = "Internal server error";

    // Handle JSON parsing errors from body-parser
    if (err instanceof SyntaxError && "body" in err) {
        errorCode = 400;
        errorMessage = "Invalid JSON in request body";
    } else if (err instanceof WebError) {
        errorCode = err.code;
        errorMessage = err.message;
    }

    // Sanitize the error message to ensure it's JSON-safe
    const sanitizedMessage = sanitizeForJson(errorMessage);

    const error = ErrorResponseSchema.parse({
        error: {
            message: sanitizedMessage,
            code: errorCode,
        },
    });

    res.status(error.error.code).json(error);
}
