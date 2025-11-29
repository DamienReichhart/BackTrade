class WebError extends Error {
  constructor(
    message: string,
    public readonly code: number,
  ) {
    super(message);
    this.code = code;
  }
}

export default WebError;
