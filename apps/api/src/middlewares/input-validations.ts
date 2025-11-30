import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";
import { logger } from "../libs/pino";
import BadRequestError from "../errors/web/bad-request-error";

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
      throw new BadRequestError(result.error.message);
    }
    next();
  };
}

export default inputValidations;
