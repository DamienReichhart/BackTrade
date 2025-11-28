import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";
import { logger } from "../libs/pino";
import { ErrorResponseSchema } from "@backtrade/types";

const inputValidationsLogger = logger.child({
  service: "input-validations",
});

function inputValidations(schema: z.ZodType<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      inputValidationsLogger.error(
        { err: result.error },
        "Input validation failed",
      );
      const error = ErrorResponseSchema.parse({
        message: result.error.message,
        code: 400,
      });
      return res.status(error.code).json(error);
    }
    next();
  };
}

export default inputValidations;
