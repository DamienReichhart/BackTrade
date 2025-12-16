export const serializers = {
    err: (err: Error) => ({
        type: err.constructor.name,
        message: err.message,
        stack: err.stack,
    }),
};
