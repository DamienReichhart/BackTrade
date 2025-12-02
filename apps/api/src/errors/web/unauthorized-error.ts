import WebError from "./web-error";

class UnauthorizedError extends WebError {
    constructor(message: string) {
        super(message, 401);
    }
}

export default UnauthorizedError;
