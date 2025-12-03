import type { Request, Response, NextFunction } from "express";
import NotFoundError from "../errors/web/not-found-error";
import { logger } from "../libs/logger/pino";

const notFoundHandlerLogger = logger.child({
    service: "not-found-handler",
});

/**
 * Middleware to handle 404 Not Found errors.
 * This should be placed after all routes but before the error handler.
 * If no route matches the request, this middleware will throw a NotFoundError.
 */
export function notFoundHandler(
    req: Request,
    _res: Response,
    _next: NextFunction
) {
    notFoundHandlerLogger.debug({ req }, "Route not found");
    // If we reach this middleware, no route matched the request
    throw new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
}
