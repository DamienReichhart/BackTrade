import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";
import { logger } from "../libs/logger/pino";
import BadRequestError from "../errors/web/bad-request-error";
import { formatZodError } from "@backtrade/utils";

const inputValidationsLogger = logger.child({
    service: "input-validations",
});

/**
 * Middleware factory that validates request body against a Zod schema
 * and attaches the validated data to the request object.
 *
 * @template T - The Zod schema type
 * @param schema - Zod schema to validate against
 */
function inputValidations<T extends z.ZodType<unknown>>(schema: T) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            inputValidationsLogger.info(
                { err: result.error },
                "Input validation failed"
            );
            const formattedMessage = formatZodError(result.error);
            throw new BadRequestError(formattedMessage);
        }
        req.validatedInput = result.data as T;
        next();
    };
}

export default inputValidations;
