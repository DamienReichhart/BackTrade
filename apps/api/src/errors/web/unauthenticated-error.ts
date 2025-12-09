import WebError from "./web-error";

class UnAuthenticatedError extends WebError {
    constructor(message: string) {
        super(message, 401);
    }
}

export default UnAuthenticatedError;
