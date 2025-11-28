import { logger } from "../libs/pino";
import type { Request, Response, NextFunction } from "express";
import { ErrorResponseSchema } from "@backtrade/types";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error({ err, req }, "unhandled error");

  const error = ErrorResponseSchema.parse({
    message: "Internal server error",
    code: 500,
  });

  res.status(error.code).json(error);
}
