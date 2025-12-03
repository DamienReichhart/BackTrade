import { logger } from "../libs/logger/pino";
import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const startTime = process.hrtime.bigint();
    logger.info({ req }, "incoming request");

    res.on("finish", () => {
        const duration =
            Number(process.hrtime.bigint() - startTime) / 1_000_000;

        logger.info({ req, res, durationMs: duration }, "request completed");
    });

    next();
}
