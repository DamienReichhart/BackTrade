/**
 * Already Exists Error (HTTP 409)
 *
 * Thrown when attempting to create a resource that already exists.
 * This indicates a conflict with the current state of the resource.
 */

import WebError from "./web-error";

/**
 * Error for resource conflicts
 *
 * Use this error when:
 * - Attempting to register an email that's already in use
 * - Creating a resource with a unique constraint violation
 * - Any operation that conflicts with existing data
 *
 * @example
 * ```typescript
 * const existingUser = await usersRepo.getUserByEmail(email);
 * if (existingUser) {
 *     throw new AlreadyExistsError("Email already in use");
 * }
 * ```
 */
class AlreadyExistsError extends WebError {
    /**
     * Error name for identification
     */
    public override readonly name: string = "AlreadyExistsError";

    /**
     * Create a new AlreadyExistsError
     *
     * @param message - Description of what already exists
     */
    constructor(message: string) {
        super(message, 409);
    }
}

export default AlreadyExistsError;
