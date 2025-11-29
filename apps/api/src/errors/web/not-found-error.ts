import WebError from "../web-errors";

class NotFoundError extends WebError {
    constructor(message: string) {
        super(message, 404);
    }
}

export default NotFoundError;