import WebError from "./web-error";

class AlreadyExistsError extends WebError {
  constructor(message: string) {
    super(message, 409);
  }
}

export default AlreadyExistsError;
