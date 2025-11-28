import { logger } from "../libs/pino";
import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error({ err, req }, "unhandled error");

  res.status(500).json({
    message: "Internal server error"
  });
}
