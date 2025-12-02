import { logger } from "../libs/pino";
import type { Request, Response, NextFunction } from "express";
import { ErrorResponseSchema } from "@backtrade/types";
import WebError from "../errors/web/web-error";

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

    if (err instanceof WebError) {
        errorCode = err.code;
        errorMessage = err.message;
    }

    const error = ErrorResponseSchema.parse({
        error: {
            message: errorMessage,
            code: errorCode,
        },
    });

    res.status(error.error.code).json(error);
}
