import WebError from "./web-error";

class NotFoundError extends WebError {
    constructor(message: string) {
        super(message, 404);
    }
}

export default NotFoundError;
