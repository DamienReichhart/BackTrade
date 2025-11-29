import { logger } from "../libs/pino";
import type { Request, Response, NextFunction } from "express";
import { ErrorResponseSchema } from "@backtrade/types";
import WebError from "../errors/web/web-error";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error({ err, req }, "unhandled error");

  let errorCode =  500;
  let errorMessage =  "Internal server error";

  if (err instanceof WebError) {
    errorCode = err.code;
    errorMessage = err.message;
  }

  const error = ErrorResponseSchema.parse({
    message: errorMessage,
    code: errorCode,
  });

  res.status(error.code).json(error);
}
