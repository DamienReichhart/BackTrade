import WebError from "./web-error";

class OutputValidationError extends WebError {
    constructor(message: string) {
        super(message, 500);
    }
}

export default OutputValidationError;
