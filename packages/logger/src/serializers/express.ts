import type { SerializerFn } from "pino";
import type { Request, Response } from "express";

/**
 * Extended Express Request type that includes custom properties
 * (e.g., id added by request-id middleware)
 */
type ExtendedRequest = Request & {
    id?: string;
};

/**
 * Express request serializer
 * Serializes Express Request objects for logging
 *
 * @param req - Express Request object
 */
export const requestSerializer: SerializerFn = (req: ExtendedRequest) => {
    return {
        id: req.id ?? "unknown",
        method: req.method ?? "unknown",
        url: req.url ?? "unknown",
        remoteAddress: req.ip ?? "unknown",
    };
};

/**
 * Express response serializer
 * Serializes Express Response objects for logging
 *
 * @param res - Express Response object
 */
export const responseSerializer: SerializerFn = (res: Response) => {
    return {
        statusCode: res.statusCode ?? 0,
    };
};

/**
 * Express serializers for use with createLogger
 * Combines request and response serializers
 */
export const expressSerializers = {
    req: requestSerializer,
    res: responseSerializer,
};
