/**
 * Bad Request Error (HTTP 400)
 *
 * Thrown when the client sends an invalid or malformed request.
 * This includes validation errors, missing required fields, and invalid formats.
 */

import WebError from "./web-error";

/**
 * Error for invalid client requests
 *
 * Use this error when:
 * - Request body fails validation
 * - Required parameters are missing
 * - Parameters have invalid format or values
 * - Business rule validation fails on input
 *
 * @example
 * ```typescript
 * if (!email) {
 *     throw new BadRequestError("Email is required");
 * }
 * ```
 */
class BadRequestError extends WebError {
    /**
     * Error name for identification
     */
    public override readonly name: string = "BadRequestError";

    /**
     * Create a new BadRequestError
     *
     * @param message - Description of what's wrong with the request
     */
    constructor(message: string) {
        super(message, 400);
    }
}

export default BadRequestError;
