import WebError from "./web-error";


class BadRequestError extends WebError {
    constructor(message: string) {
        super(message, 400);
    }
}

export default BadRequestError;