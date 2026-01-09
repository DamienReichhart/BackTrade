/**
 * Forbidden Error (HTTP 403)
 *
 * Thrown when an authenticated user lacks permission to perform an action.
 * The user is authenticated but not authorized for this operation.
 */

import WebError from "./web-error";

/**
 * Error for authorization failures
 *
 * Use this error when:
 * - User tries to access another user's resources
 * - Non-admin user tries to perform admin-only operations
 * - User doesn't own the session/entity they're trying to modify
 *
 * Note: This is different from UnAuthenticatedError (401) which is for
 * users who haven't authenticated at all.
 *
 * @example
 * ```typescript
 * if (session.user_id !== user.id && user.role !== "ADMIN") {
 *     throw new ForbiddenError("You don't have permission to access this session");
 * }
 * ```
 */
class ForbiddenError extends WebError {
    /**
     * Error name for identification
     */
    public override readonly name: string = "ForbiddenError";

    /**
     * Create a new ForbiddenError
     *
     * @param message - Description of what permission is lacking
     */
    constructor(message: string) {
        super(message, 403);
    }
}

export default ForbiddenError;
