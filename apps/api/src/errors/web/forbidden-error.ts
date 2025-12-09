import WebError from "./web-error";

class ForbiddenError extends WebError {
    constructor(message: string) {
        super(message, 403);
    }
}

export default ForbiddenError;
