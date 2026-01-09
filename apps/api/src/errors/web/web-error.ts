/**
 * Web Error Base Class
 *
 * Base class for all HTTP-related errors in the application.
 * Provides consistent error structure with HTTP status codes.
 */

/**
 * Base class for HTTP errors
 *
 * All HTTP-specific errors should extend this class. The error handler
 * middleware uses the `code` property to set the HTTP response status.
 *
 * @example
 * ```typescript
 * class CustomError extends WebError {
 *     constructor(message: string) {
 *         super(message, 422);
 *         this.name = "CustomError";
 *     }
 * }
 * ```
 */
class WebError extends Error {
    /**
     * Error name for identification in stack traces and error handling
     */
    public override readonly name: string = "WebError";

    /**
     * HTTP status code to return in the response
     */
    public readonly code: number;

    /**
     * Create a new WebError
     *
     * @param message - Human-readable error message
     * @param code - HTTP status code (e.g., 400, 404, 500)
     */
    constructor(message: string, code: number) {
        super(message);
        this.code = code;

        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default WebError;
