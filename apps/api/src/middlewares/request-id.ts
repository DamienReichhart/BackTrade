import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to generate and attach a unique request ID to each request.
 * This ID is used for request tracing and logging.
 */
export function requestId(req: Request, _res: Response, next: NextFunction) {
  req.id = randomUUID();
  next();
}

