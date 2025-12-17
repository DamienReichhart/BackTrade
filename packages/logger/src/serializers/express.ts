import type { SerializerFn } from "pino";

/**
 * Express request serializer
 * Serializes Express Request objects for logging
 *
 * @param req - Express Request object
 */
export const requestSerializer: SerializerFn = (req: any) => {
    // Type-safe access with fallbacks for Express Request properties
    const expressReq = req as {
        id?: string;
        method?: string;
        url?: string;
        ip?: string;
    };

    return {
        id: expressReq.id ?? "unknown",
        method: expressReq.method ?? "unknown",
        url: expressReq.url ?? "unknown",
        remoteAddress: expressReq.ip ?? "unknown",
    };
};

/**
 * Express response serializer
 * Serializes Express Response objects for logging
 *
 * @param res - Express Response object
 */
export const responseSerializer: SerializerFn = (res: any) => {
    // Type-safe access with fallback for Express Response properties
    const expressRes = res as {
        statusCode?: number;
    };

    return {
        statusCode: expressRes.statusCode ?? 0,
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
