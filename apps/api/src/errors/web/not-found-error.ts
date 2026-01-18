/**
 * Not Found Error (HTTP 404)
 *
 * Thrown when a requested resource cannot be found.
 * This includes entities that don't exist or have been deleted.
 */

import WebError from "./web-error";

/**
 * Error for missing resources
 *
 * Use this error when:
 * - A database entity with the given ID doesn't exist
 * - A requested route or endpoint doesn't exist
 * - A referenced entity (e.g., session, instrument) cannot be found
 *
 * @example
 * ```typescript
 * const position = await positionsRepo.getPositionById(id);
 * if (!position) {
 *     throw new NotFoundError("Position not found");
 * }
 * ```
 */
class NotFoundError extends WebError {
    /**
     * Error name for identification
     */
    public override readonly name: string = "NotFoundError";

    /**
     * Create a new NotFoundError
     *
     * @param message - Description of what resource was not found
     */
    constructor(message: string) {
        super(message, 404);
    }
}

export default NotFoundError;
