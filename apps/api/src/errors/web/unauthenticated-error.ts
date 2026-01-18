/**
 * Unauthenticated Error (HTTP 401)
 *
 * Thrown when authentication is required but not provided or invalid.
 * This includes missing tokens, expired tokens, and invalid credentials.
 */

import WebError from "./web-error";

/**
 * Error for authentication failures
 *
 * Use this error when:
 * - No authentication token is provided
 * - The authentication token is invalid or expired
 * - Login credentials are incorrect
 * - The user account is not found during authentication
 *
 * Note: This is different from ForbiddenError (403) which is for
 * authenticated users who lack permission.
 *
 * @example
 * ```typescript
 * const token = req.headers.authorization?.split(" ")[1];
 * if (!token) {
 *     throw new UnAuthenticatedError("Authentication required");
 * }
 * ```
 */
class UnAuthenticatedError extends WebError {
    /**
     * Error name for identification
     */
    public override readonly name: string = "UnAuthenticatedError";

    /**
     * Create a new UnAuthenticatedError
     *
     * @param message - Description of the authentication failure
     */
    constructor(message: string) {
        super(message, 401);
    }
}

export default UnAuthenticatedError;
