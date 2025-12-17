import type { SerializerFn } from "pino";

/**
 * Default error serializer
 * Serializes Error objects to include type, message, and stack trace
 */
export const errorSerializer: SerializerFn = (err: Error) => {
    if (!(err instanceof Error)) {
        return err;
    }

    return {
        type: err.constructor.name,
        message: err.message,
        stack: err.stack,
    };
};

/**
 * Default serializers for common objects
 * Can be extended or overridden when creating a logger
 */
export const defaultSerializers: Record<string, SerializerFn> = {
    err: errorSerializer,
    error: errorSerializer,
};
